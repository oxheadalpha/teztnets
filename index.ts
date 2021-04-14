import * as pulumi from "@pulumi/pulumi";
import * as eks from "@pulumi/eks";
import * as k8s from "@pulumi/kubernetes";
import * as awsx from "@pulumi/awsx";
import * as aws from "@pulumi/aws";

import * as fs from 'fs';
import * as YAML from 'yaml'

let stack = pulumi.getStack();

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
    constructor(name: string, valuesPath: string, k8sRepo: string, cluster: eks.Cluster, repo: awsx.ecr.Repository, opts?: pulumi.ResourceOptions) {

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

        const helmValuesFile = fs.readFileSync(valuesPath, 'utf8')
        const helmValues = YAML.parse(helmValuesFile)
        
        // Deploy Tezos into our cluster.
        this.chain = new k8s.helm.v2.Chart(this.name, {
            namespace: this.ns.metadata.name,
            chart: 'tezos-chain',
            fetchOpts: { repo: k8sRepo },
            values: helmValues,
        }, { providers: { "kubernetes": cluster.provider } });
        
        // Ingresses

        const rpc_ingress = new k8s.extensions.v1beta1.Ingress(
          `${this.name}-rpc-ingress`,
          {
            metadata: {
              namespace: this.ns.metadata.name,
              name: this.name,
              annotations: {
                "kubernetes.io/ingress.class": "alb",
                "alb.ingress.kubernetes.io/scheme": "internet-facing",
                "alb.ingress.kubernetes.io/healthcheck-path": "/chains/main/blocks/head/header",
                "alb.ingress.kubernetes.io/healthcheck-port": "8732"
              },
              labels: { app: "tezos-node" }
            },
            spec: {
              rules: [
                {
                  http: {
                    paths: [
                      {
                        path: "/*",
                        backend: { serviceName: "tezos-node-rpc", servicePort: "rpc" }
                      }
                    ]
                  }
                }
              ]
            }
          },
          { provider: cluster.provider }
        );
    }

}
const repo = new awsx.ecr.Repository(stack);

const desiredClusterCapacity = 2;
const aws_account_id = process.env.AWS_ACCOUNT_ID;
if (aws_account_id == null) {
  pulumi.log.info("AWS_ACCOUNT_ID undefined");
} else {
    pulumi.log.info("Here's 1st char of account id");
    pulumi.log.info(aws_account_id.charAt(0));
}
pulumi.log.info(`arn:aws:iam::${aws_account_id}:role/KubernetesAdmin`);

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
const private_chain = new TezosK8s("mondaynet", "mondaynet/values.yaml", "https://tqtezos.github.io/tezos-helm-charts/", cluster, repo);
