import * as pulumi from "@pulumi/pulumi";
import * as eks from "@pulumi/eks";
import * as k8s from "@pulumi/kubernetes";
import * as awsx from "@pulumi/awsx";
import * as aws from "@pulumi/aws";

import { TezosChain } from "./TezosChain"; // replacement for LegacyChain, as presently instanti
import { PeriodicChain } from "./PeriodicChain";


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
const dailynet_chain = new PeriodicChain("dailynet",
    {
        description: "A testnet that restarts every day launched from tezos/tezos master branch and protocol alpha.",
        bootstrapContracts: ['taquito1.json'],
        bootstrapCommitments: "commitments.json",
        helmValuesPath: "mondaynet/values.yaml",
        k8sRepoPath: "mondaynet/tezos-k8s",
        private_baking_key: private_baking_key,
        private_non_baking_key: private_non_baking_key
    },
    "0 0 * * *", cluster.provider, repo);

const mondaynet_chain = new PeriodicChain("mondaynet",
    {
        description: "A testnet that restarts every Monday launched from tezos/tezos master branch and protocol alpha.",
        bootstrapContracts: ['taquito1.json'],
        bootstrapCommitments: "commitments.json",
        helmValuesPath: "mondaynet/values.yaml",
        k8sRepoPath: "mondaynet/tezos-k8s",
        private_baking_key: private_baking_key,
        private_non_baking_key: private_non_baking_key
    },
    "0 0 * * MON", cluster.provider, repo);

const florencenet_chain = new TezosChain("florencenet",
    {
        dnsName: "florencenoba",
        description: "Long-running test network for the florence protocol.",
        publicBootstrapPeers: [
            "florencenobanet.smartpy.io:9733",
            "florencenobanet.tezos.co.il",
            "florencenobanet.kaml.fr",
            "florencenobanet.boot.tez.ie",                                          
        ],
        helmValuesPath: "florencenet/values.yaml",
        k8sRepoPath: "florencenet/tezos-k8s",
        private_baking_key: private_baking_key,
        private_non_baking_key: private_non_baking_key

    }, cluster.provider, repo);

const granadanet_chain = new TezosChain("granadanet",
    {
        description: "Long-running testnet for Granada proposal.",
        publicBootstrapPeers: [
            "granadanet.smartpy.io",
            "granadanet.tezos.co.il",
            "granadanet.kaml.fr",
        ],
        bootstrapCommitments: "commitments.json",
        helmValuesPath: "granadanet/values.yaml",
        k8sRepoPath: "granadanet/tezos-k8s",
        private_baking_key: private_baking_key,
        private_non_baking_key: private_non_baking_key

    }, cluster.provider, repo);


function getNetworks(chains: TezosChain[]): object {
    const networks: {[name: string]: object} = {};

    chains.forEach(function (chain) {
        const bootstrapPeers: string[] = Object.assign([], chain.publicBootstrapPeers); // clone
        bootstrapPeers.splice(0, 0, `${chain.name}.tznode.net`);
    
        // genesis_pubkey is the public key associated with the $TEZOS_BAKING_KEY private key in github secrets
        // TODO: generate it dynamically based on privkey
        const genesisPubkey = "edpkuix6Lv8vnrz6uDe1w8uaXY7YktitAxn6EHdy2jdzq5n5hZo94n";

        const network = Object.assign({}, chain.helmValues["node_config_network"]); // clone
        network["sandboxed_chain_name"] = "SANDBOXED_TEZOS";
        network["default_bootstrap_peers"] = bootstrapPeers;
        network["genesis_parameters"] = {
            "values": {
                "genesis_pubkey": genesisPubkey
            }
        };
        if ("activation_account_name" in network) {
            delete network["activation_account_name"];
        };
        
        networks[chain.route53_name] = network;
    })

    return networks;
}

function getTeztnets(chains: TezosChain[]): object {
    const teztnets: {[name: string]: object} = {};

    chains.forEach(function (chain) {
        teztnets[chain.route53_name] = {
            chain_name: chain.getChainName(),
            network_url: chain.getNetworkUrl(),
            description: chain.getDescription(),
            docker_build: chain.getDockerBuild(),
            command: chain.getCommand()    
        };
    })

    return teztnets;
}

export const networks = getNetworks([dailynet_chain, mondaynet_chain, florencenet_chain, granadanet_chain]);
export const teztnets = getTeztnets([dailynet_chain, mondaynet_chain, florencenet_chain, granadanet_chain]);
