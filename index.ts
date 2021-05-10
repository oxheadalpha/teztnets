import * as pulumi from "@pulumi/pulumi";
import * as eks from "@pulumi/eks";
import * as k8s from "@pulumi/kubernetes";
import * as awsx from "@pulumi/awsx";
import * as aws from "@pulumi/aws";
import {createAliasRecord} from "./route53";

import * as fs from 'fs';
import * as YAML from 'yaml'

let stack = pulumi.getStack();

// Function to fail on non-truthy variable.
const getEnvVariable = (name: string): string => {
  const env = process.env[name];
  if (!env) {
    pulumi.log.error(`${name} environment variable is not set`);
    throw Error;
  }
  return env;
};

/**
 * Deploy a tezos-k8s topology in a k8s cluster.
 * Supports either local charts or charts from a repo
 */
export class TezosK8s extends pulumi.ComponentResource {
    readonly name: string;
    readonly valuesPath: string;
    readonly ns: k8s.core.v1.Namespace;
    readonly chain: k8s.helm.v2.Chart;

    /**
    * Deploys a private chain on a cluster.
    * @param name The name of the private chain.
    * @param valuesPath The path to the values.yaml file for the helm chart
    * @param 
    * @param cluster The kubernetes cluster to deploy it into.
    * @param repo The ECR repository where to push the custom images for this chain.
    */
    constructor(name: string, valuesPath: string, k8sRepoPath: string, private_baking_key: string, private_non_baking_key: string, cluster: eks.Cluster, repo: awsx.ecr.Repository, opts?: pulumi.ResourceOptions) {

        const inputs: pulumi.Inputs = {
            options: opts,
        };
        super("pulumi-contrib:components:TezosK8s", name, inputs, opts);

        // Default resource options for this component's child resources.
        const defaultResourceOptions: pulumi.ResourceOptions = { parent: this };

        this.name = name;
        this.valuesPath = valuesPath;
        this.ns = new k8s.core.v1.Namespace(this.name, {metadata: {name:this.name,}},
                            { provider: cluster.provider});

        const defaultHelmValuesFile = fs.readFileSync(`${k8sRepoPath}/charts/tezos/values.yaml`, 'utf8')
        const defaultHelmValues = YAML.parse(defaultHelmValuesFile)
        
        const helmValuesFile = fs.readFileSync(valuesPath, 'utf8')
        const helmValues = YAML.parse(helmValuesFile)

        helmValues["accounts"]["tqbaker"] = {
               "key": private_baking_key,
               "type": "secret",
               "is_bootstrap_baker_account": true,
               "bootstrap_balance": "2500000000000"
        }
        helmValues["accounts"]["tqfree"] = {
               "key": private_non_baking_key,
               "type": "secret",
               "is_bootstrap_baker_account": false,
               "bootstrap_balance": "5000000000000000"
        }
        
        const tezosK8sImages = defaultHelmValues["tezos_k8s_images"]
        // do not build zerotier for now since it takes times and it is not used in tqinfra
        delete tezosK8sImages["zerotier"]

        const pulumiTaggedImages = Object.entries(tezosK8sImages).reduce(
            (obj: {[index: string]:any}, [key]) => {
                obj[key] = repo.buildAndPushImage(`${k8sRepoPath}/${key.replace(/_/g, "-")}`)
                return obj
            },
            {}
        )
        helmValues["tezos_k8s_images"] = pulumiTaggedImages
        // deploy from repository
        //this.chain = new k8s.helm.v2.Chart(this.name, {
        //    namespace: this.ns.metadata.name,
        //    chart: 'tezos-chain',
        //    fetchOpts: { repo: k8sRepo },
        //    values: helmValues,
        //}, { providers: { "kubernetes": cluster.provider } });
        
        // Deploy Tezos into our cluster
        // Deploy from file
        this.chain = new k8s.helm.v2.Chart(this.name, {
            namespace: this.ns.metadata.name,
            path: `${k8sRepoPath}/charts/tezos`,
            values: helmValues,
        }, { providers: { "kubernetes": cluster.provider } });

        const p2p_lb_service = new k8s.core.v1.Service(
          `${this.name}-p2p-lb`,
          {
            metadata: {
              namespace: this.ns.metadata.name,
              name: this.name,
              annotations: {
                "service.beta.kubernetes.io/aws-load-balancer-type": "nlb-ip",
              },
            },
            spec: {
                ports:
                    [ { port: 9732,
                        targetPort: 9732,
                        protocol: "TCP" } ],
                selector:
                    { app: "tezos-baking-node" },
                type: "LoadBalancer"
            }
          },
          { provider: cluster.provider }
        );
        let aRecord = p2p_lb_service.status.apply((s) =>
            createAliasRecord(`${this.name}.tznode.net`, s.loadBalancer.ingress[0].hostname)
        );

    }

}
const repo = new awsx.ecr.Repository(stack);

const desiredClusterCapacity = 2;
const aws_account_id = getEnvVariable('AWS_ACCOUNT_ID');
const private_baking_key = getEnvVariable('PRIVATE_BAKING_KEY');
const private_non_baking_key = getEnvVariable('PRIVATE_NON_BAKING_KEY');

// Create a VPC with subnets that are tagged for load balancer usage.
// See: https://github.com/pulumi/pulumi-eks/tree/master/examples/subnet-tags
const vpc = new awsx.ec2.Vpc("vpc",
    {
        subnets: [
            // Tag subnets for specific load-balancer usage.
            // Any non-null tag value is valid.
            // See:
            //  - https://docs.aws.amazon.com/eks/latest/userguide/network_reqs.html
            //  - https://github.com/pulumi/pulumi-eks/issues/196
            //  - https://github.com/pulumi/pulumi-eks/issues/415
            {type: "public", tags: {"kubernetes.io/role/elb": "1"}},
            {type: "private", tags: {"kubernetes.io/role/internal-elb": "1"}},
        ],
    },
    {
        // Inform pulumi to ignore tag changes to the VPCs or subnets, so that
        // tags auto-added by AWS EKS do not get removed during future
        // refreshes and updates, as they are added outside of pulumi's management
        // and would be removed otherwise.
        // See: https://github.com/pulumi/pulumi-eks/issues/271#issuecomment-548452554
        transformations: [(args: any) => {
            if (args.type === "aws:ec2/vpc:Vpc" || args.type === "aws:ec2/subnet:Subnet") {
                return {
                    props: args.props,
                    opts: pulumi.mergeOptions(args.opts, { ignoreChanges: ["tags"] }),
                };
            }
            return undefined;
        }],
    },
);

const cluster = new eks.Cluster(stack, {
    instanceType: "t3.2xlarge",
    desiredCapacity: desiredClusterCapacity,
    minSize: 1,
    maxSize: 5,
    providerCredentialOpts: {
            roleArn   : `arn:aws:iam::${aws_account_id}:role/KubernetesAdmin`,
    },
    roleMappings: [
        {
            groups    : ["system:masters"],
            roleArn   : `arn:aws:iam::${aws_account_id}:role/KubernetesAdmin`,
            username  : "admin",
        }
    ],
    vpcId: vpc.id,
    publicSubnetIds: vpc.publicSubnetIds,
    privateSubnetIds: vpc.privateSubnetIds,
},)

// Export the cluster's kubeconfig.
export const kubeconfig = cluster.kubeconfig;
export const clusterName = cluster.eksCluster.name;
export const clusterNodeInstanceRoleName = cluster.instanceRoles.apply(
      roles => roles[0].name
);

// Create IAM Policy for the IngressController called "ingressController-iam-policy” and read the policy ARN.
const ingressControllerPolicy = new aws.iam.Policy(
  "ingressController-iam-policy",
  {
    policy: {
      Version: "2012-10-17",
      Statement: [
        {
          Effect: "Allow",
          Action: [
            "acm:DescribeCertificate",
            "acm:ListCertificates",
            "acm:GetCertificate"
          ],
          Resource: "*"
        },
        {
          Effect: "Allow",
          Action: [
            "ec2:AuthorizeSecurityGroupIngress",
            "ec2:CreateSecurityGroup",
            "ec2:CreateTags",
            "ec2:DeleteTags",
            "ec2:DeleteSecurityGroup",
            "ec2:DescribeInstances",
            "ec2:DescribeInstanceStatus",
            "ec2:DescribeSecurityGroups",
            "ec2:DescribeSubnets",
            "ec2:DescribeTags",
            "ec2:DescribeVpcs",
            "ec2:ModifyInstanceAttribute",
            "ec2:ModifyNetworkInterfaceAttribute",
            "ec2:RevokeSecurityGroupIngress"
          ],
          Resource: "*"
        },
        {
          Effect: "Allow",
          Action: [
            "elasticloadbalancing:AddTags",
            "elasticloadbalancing:CreateListener",
            "elasticloadbalancing:CreateLoadBalancer",
            "elasticloadbalancing:CreateRule",
            "elasticloadbalancing:CreateTargetGroup",
            "elasticloadbalancing:DeleteListener",
            "elasticloadbalancing:DeleteLoadBalancer",
            "elasticloadbalancing:DeleteRule",
            "elasticloadbalancing:DeleteTargetGroup",
            "elasticloadbalancing:DeregisterTargets",
            "elasticloadbalancing:DescribeListeners",
            "elasticloadbalancing:DescribeListenerCertificates",
            "elasticloadbalancing:DescribeLoadBalancers",
            "elasticloadbalancing:DescribeLoadBalancerAttributes",
            "elasticloadbalancing:DescribeRules",
            "elasticloadbalancing:DescribeSSLPolicies",
            "elasticloadbalancing:DescribeTags",
            "elasticloadbalancing:DescribeTargetGroups",
            "elasticloadbalancing:DescribeTargetGroupAttributes",
            "elasticloadbalancing:DescribeTargetHealth",
            "elasticloadbalancing:ModifyListener",
            "elasticloadbalancing:ModifyLoadBalancerAttributes",
            "elasticloadbalancing:ModifyRule",
            "elasticloadbalancing:ModifyTargetGroup",
            "elasticloadbalancing:ModifyTargetGroupAttributes",
            "elasticloadbalancing:RegisterTargets",
            "elasticloadbalancing:RemoveTags",
            "elasticloadbalancing:SetIpAddressType",
            "elasticloadbalancing:SetSecurityGroups",
            "elasticloadbalancing:SetSubnets",
            "elasticloadbalancing:SetWebACL"
          ],
          Resource: "*"
        },
        {
          Effect: "Allow",
          Action: ["iam:GetServerCertificate", "iam:ListServerCertificates"],
          Resource: "*"
        },
        {
          Effect: "Allow",
          Action: [
            "waf-regional:GetWebACLForResource",
            "waf-regional:GetWebACL",
            "waf-regional:AssociateWebACL",
            "waf-regional:DisassociateWebACL",
            "wafv2:GetWebACLForResource"
          ],
          Resource: "*"
        },
        {
          Effect: "Allow",
          Action: ["tag:GetResources", "tag:TagResources"],
          Resource: "*"
        },
        {
          Effect: "Allow",
          Action: ["waf:GetWebACL"],
          Resource: "*"
        }
      ]
    }
  }
);

// Attach this policy to the NodeInstanceRole of the worker nodes.
export const nodeinstanceRole = new aws.iam.RolePolicyAttachment(
  "eks-NodeInstanceRole-policy-attach",
  {
    policyArn: ingressControllerPolicy.arn,
    role: clusterNodeInstanceRoleName
  }
);

// Declare the ALBIngressController in 1 step with the Helm Chart.
const albingresscntlr = new k8s.helm.v2.Chart(
  "alb",
  {
    chart:
      "aws-load-balancer-controller",
    fetchOpts:{
        repo: "https://aws.github.io/eks-charts",
    },
    values: {
      clusterName: clusterName,
      autoDiscoverAwsRegion: "true",
      autoDiscoverAwsVpcID: "true"
    }
  },
  { provider: cluster.provider }
);

// chains
//const private_chain = new TezosK8s("mondaynet", "mondaynet/values.yaml", "https://tqtezos.github.io/tezos-helm-charts/",
//                                   private_baking_key, private_non_baking_key, cluster, repo);
const private_chain = new TezosK8s("mondaynet", "mondaynet/values.yaml", "mondaynet/tezos-k8s",
                                   private_baking_key, private_non_baking_key, cluster, repo);
const galpha2net_chain = new TezosK8s("galpha2net", "galpha2net/values.yaml", "galpha2net/tezos-k8s",
                                   private_baking_key, private_non_baking_key, cluster, repo);
