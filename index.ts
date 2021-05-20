import * as pulumi from "@pulumi/pulumi";
import * as eks from "@pulumi/eks";
import * as k8s from "@pulumi/kubernetes";
import * as awsx from "@pulumi/awsx";
import * as aws from "@pulumi/aws";
import {createAliasRecord} from "./route53";

import * as fs from 'fs';
import * as YAML from 'yaml'

const mime = require("mime");

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

function publicReadPolicyForBucket(bucketName: string) {
    return JSON.stringify({
        Version: "2012-10-17",
        Statement: [{
    	Effect: "Allow",
    	Principal: "*",
    	Action: [
    	    "s3:GetObject"
    	],
    	Resource: [
    	    `arn:aws:s3:::${bucketName}/*` // policy refers to bucket name explicitly
    	]
        }]
    });
}

/**
 * Deploy a tezos-k8s topology in a k8s cluster.
 * Supports either local charts or charts from a repo
 */
export class TezosK8s extends pulumi.ComponentResource {
    readonly name: string;
    readonly route53_name: string;
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
    constructor(name: string, route53_name: string, valuesPath: string, teztnetMetadataPath: string, k8sRepoPath: string, private_baking_key: string, private_non_baking_key: string, cluster: eks.Cluster, repo: awsx.ecr.Repository, opts?: pulumi.ResourceOptions) {

        const inputs: pulumi.Inputs = {
            options: opts,
        };

        const helmValuesFile = fs.readFileSync(valuesPath, 'utf8')
        const helmValues = YAML.parse(helmValuesFile)
        name = name || helmValues["node_config_network"]["chain_name"].split("T00")[0].toLowerCase().replace(/_/g,'-')

        super("pulumi-contrib:components:TezosK8s", name, inputs, opts);

        // Default resource options for this component's child resources.
        const defaultResourceOptions: pulumi.ResourceOptions = { parent: this };

        this.name = name;
        this.route53_name = route53_name;
        this.valuesPath = valuesPath;
        this.ns = new k8s.core.v1.Namespace(this.name, {metadata: {name:this.name,}},
                            { provider: cluster.provider});

        const defaultHelmValuesFile = fs.readFileSync(`${k8sRepoPath}/charts/tezos/values.yaml`, 'utf8')
        const defaultHelmValues = YAML.parse(defaultHelmValuesFile)

        const teztnetMetadataFile = fs.readFileSync(teztnetMetadataPath, 'utf8')
        const teztnetMetadata = YAML.parse(teztnetMetadataFile)
        if ("activation" in helmValues &&
            ("bootstrap_contracts" in teztnetMetadata || "bootstrap_commitments" in teztnetMetadata)) {
            const activationBucket = new aws.s3.Bucket("activation-bucket");
	    const bucketPolicy = new aws.s3.BucketPolicy("activation-bucket-policy", {
		bucket: activationBucket.bucket,
		policy: activationBucket.bucket.apply(publicReadPolicyForBucket)
	    })
            helmValues["activation"]["bootstrap_contract_urls"] = []

            teztnetMetadata["bootstrap_contracts"].forEach(function (contractFile: any) {
		const bucketObject = new aws.s3.BucketObject(contractFile, {
		    bucket: activationBucket.bucket,
                    source: new pulumi.asset.FileAsset(`bootstrap_contracts/${contractFile}`),
                    contentType: mime.getType(contractFile) 
		});
                helmValues["activation"]["bootstrap_contract_urls"].push(pulumi.interpolate `https://${activationBucket.bucketRegionalDomainName}/${contractFile}`);
            })
            if ("bootstrap_commitments" in teztnetMetadata) {
                let commitmentFile = teztnetMetadata["bootstrap_commitments"]
		const bucketObject = new aws.s3.BucketObject(commitmentFile, {
		    bucket: activationBucket.bucket,
                    source: new pulumi.asset.FileAsset(`bootstrap_commitments/${commitmentFile}`),
                    contentType: mime.getType(commitmentFile)
		});
                helmValues["activation"]["commitments_url"] = pulumi.interpolate `https://${activationBucket.bucketRegionalDomainName}/${commitmentFile}`;
            }
        }

        helmValues["accounts"]["tqbaker"]["key"] = private_baking_key
        helmValues["accounts"]["tqfree"]["key"] = private_non_baking_key
        
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
                "service.beta.kubernetes.io/aws-load-balancer-scheme": "internet-facing",
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
            createAliasRecord(`${this.route53_name}.tznode.net`, s.loadBalancer.ingress[0].hostname)
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
        "Version": "2012-10-17",
        "Statement": [
            {
                "Effect": "Allow",
                "Action": [
                    "iam:CreateServiceLinkedRole",
                    "ec2:DescribeAccountAttributes",
                    "ec2:DescribeAddresses",
                    "ec2:DescribeAvailabilityZones",
                    "ec2:DescribeInternetGateways",
                    "ec2:DescribeVpcs",
                    "ec2:DescribeSubnets",
                    "ec2:DescribeSecurityGroups",
                    "ec2:DescribeInstances",
                    "ec2:DescribeNetworkInterfaces",
                    "ec2:DescribeTags",
                    "ec2:GetCoipPoolUsage",
                    "ec2:DescribeCoipPools",
                    "elasticloadbalancing:DescribeLoadBalancers",
                    "elasticloadbalancing:DescribeLoadBalancerAttributes",
                    "elasticloadbalancing:DescribeListeners",
                    "elasticloadbalancing:DescribeListenerCertificates",
                    "elasticloadbalancing:DescribeSSLPolicies",
                    "elasticloadbalancing:DescribeRules",
                    "elasticloadbalancing:DescribeTargetGroups",
                    "elasticloadbalancing:DescribeTargetGroupAttributes",
                    "elasticloadbalancing:DescribeTargetHealth",
                    "elasticloadbalancing:DescribeTags"
                ],
                "Resource": "*"
            },
            {
                "Effect": "Allow",
                "Action": [
                    "cognito-idp:DescribeUserPoolClient",
                    "acm:ListCertificates",
                    "acm:DescribeCertificate",
                    "iam:ListServerCertificates",
                    "iam:GetServerCertificate",
                    "waf-regional:GetWebACL",
                    "waf-regional:GetWebACLForResource",
                    "waf-regional:AssociateWebACL",
                    "waf-regional:DisassociateWebACL",
                    "wafv2:GetWebACL",
                    "wafv2:GetWebACLForResource",
                    "wafv2:AssociateWebACL",
                    "wafv2:DisassociateWebACL",
                    "shield:GetSubscriptionState",
                    "shield:DescribeProtection",
                    "shield:CreateProtection",
                    "shield:DeleteProtection"
                ],
                "Resource": "*"
            },
            {
                "Effect": "Allow",
                "Action": [
                    "ec2:AuthorizeSecurityGroupIngress",
                    "ec2:RevokeSecurityGroupIngress"
                ],
                "Resource": "*"
            },
            {
                "Effect": "Allow",
                "Action": [
                    "ec2:CreateSecurityGroup"
                ],
                "Resource": "*"
            },
            {
                "Effect": "Allow",
                "Action": [
                    "ec2:CreateTags"
                ],
                "Resource": "arn:aws:ec2:*:*:security-group/*",
                "Condition": {
                    "StringEquals": {
                        "ec2:CreateAction": "CreateSecurityGroup"
                    },
                    "Null": {
                        "aws:RequestTag/elbv2.k8s.aws/cluster": "false"
                    }
                }
            },
            {
                "Effect": "Allow",
                "Action": [
                    "ec2:CreateTags",
                    "ec2:DeleteTags"
                ],
                "Resource": "arn:aws:ec2:*:*:security-group/*",
                "Condition": {
                    "Null": {
                        "aws:RequestTag/elbv2.k8s.aws/cluster": "true",
                        "aws:ResourceTag/elbv2.k8s.aws/cluster": "false"
                    }
                }
            },
            {
                "Effect": "Allow",
                "Action": [
                    "ec2:AuthorizeSecurityGroupIngress",
                    "ec2:RevokeSecurityGroupIngress",
                    "ec2:DeleteSecurityGroup"
                ],
                "Resource": "*",
                "Condition": {
                    "Null": {
                        "aws:ResourceTag/elbv2.k8s.aws/cluster": "false"
                    }
                }
            },
            {
                "Effect": "Allow",
                "Action": [
                    "elasticloadbalancing:CreateLoadBalancer",
                    "elasticloadbalancing:CreateTargetGroup"
                ],
                "Resource": "*",
                "Condition": {
                    "Null": {
                        "aws:RequestTag/elbv2.k8s.aws/cluster": "false"
                    }
                }
            },
            {
                "Effect": "Allow",
                "Action": [
                    "elasticloadbalancing:CreateListener",
                    "elasticloadbalancing:DeleteListener",
                    "elasticloadbalancing:CreateRule",
                    "elasticloadbalancing:DeleteRule"
                ],
                "Resource": "*"
            },
            {
                "Effect": "Allow",
                "Action": [
                    "elasticloadbalancing:AddTags",
                    "elasticloadbalancing:RemoveTags"
                ],
                "Resource": [
                    "arn:aws:elasticloadbalancing:*:*:targetgroup/*/*",
                    "arn:aws:elasticloadbalancing:*:*:loadbalancer/net/*/*",
                    "arn:aws:elasticloadbalancing:*:*:loadbalancer/app/*/*"
                ],
                "Condition": {
                    "Null": {
                        "aws:RequestTag/elbv2.k8s.aws/cluster": "true",
                        "aws:ResourceTag/elbv2.k8s.aws/cluster": "false"
                    }
                }
            },
            {
                "Effect": "Allow",
                "Action": [
                    "elasticloadbalancing:AddTags",
                    "elasticloadbalancing:RemoveTags"
                ],
                "Resource": [
                    "arn:aws:elasticloadbalancing:*:*:listener/net/*/*/*",
                    "arn:aws:elasticloadbalancing:*:*:listener/app/*/*/*",
                    "arn:aws:elasticloadbalancing:*:*:listener-rule/net/*/*/*",
                    "arn:aws:elasticloadbalancing:*:*:listener-rule/app/*/*/*"
                ]
            },
            {
                "Effect": "Allow",
                "Action": [
                    "elasticloadbalancing:ModifyLoadBalancerAttributes",
                    "elasticloadbalancing:SetIpAddressType",
                    "elasticloadbalancing:SetSecurityGroups",
                    "elasticloadbalancing:SetSubnets",
                    "elasticloadbalancing:DeleteLoadBalancer",
                    "elasticloadbalancing:ModifyTargetGroup",
                    "elasticloadbalancing:ModifyTargetGroupAttributes",
                    "elasticloadbalancing:DeleteTargetGroup"
                ],
                "Resource": "*",
                "Condition": {
                    "Null": {
                        "aws:ResourceTag/elbv2.k8s.aws/cluster": "false"
                    }
                }
            },
            {
                "Effect": "Allow",
                "Action": [
                    "elasticloadbalancing:RegisterTargets",
                    "elasticloadbalancing:DeregisterTargets"
                ],
                "Resource": "arn:aws:elasticloadbalancing:*:*:targetgroup/*/*"
            },
            {
                "Effect": "Allow",
                "Action": [
                    "elasticloadbalancing:SetWebAcl",
                    "elasticloadbalancing:ModifyListener",
                    "elasticloadbalancing:AddListenerCertificates",
                    "elasticloadbalancing:RemoveListenerCertificates",
                    "elasticloadbalancing:ModifyRule"
                ],
                "Resource": "*"
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
    version: "1.2.0",
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
const mondaynet_chain = new TezosK8s("", "mondaynet", "mondaynet/values.yaml", "mondaynet/metadata.yaml", "mondaynet/tezos-k8s",
                                   private_baking_key, private_non_baking_key, cluster, repo);
const florencenet_chain = new TezosK8s("florencenet", "florencenoba", "florencenet/values.yaml", "florencenet/metadata.yaml", "florencenet/tezos-k8s",
                                   private_baking_key, private_non_baking_key, cluster, repo);
const galpha2net_chain = new TezosK8s("galpha2net", "galpha2net", "galpha2net/values.yaml", "galpha2net/metadata.yaml", "galpha2net/tezos-k8s",
                                   private_baking_key, private_non_baking_key, cluster, repo);
const granadanet_chain = new TezosK8s("granadanet", "granadanet", "granadanet/values.yaml", "granadanet/metadata.yaml", "granadanet/tezos-k8s",
                                   private_baking_key, private_non_baking_key, cluster, repo);
