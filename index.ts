import * as pulumi from "@pulumi/pulumi";
import * as eks from "@pulumi/eks";
import * as k8s from "@pulumi/kubernetes";
import * as awsx from "@pulumi/awsx";
import * as aws from "@pulumi/aws";

import deployAwsAlbController from "./awsAlbController"
import { TezosChain, TezosChainParametersBuilder } from "./TezosChain";

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
const faucetSeed = getEnvVariable('FAUCET_SEED');
const faucetRecaptchaSiteKey = getEnvVariable('FAUCET_RECAPTCHA_SITE_KEY');
const faucetRecaptchaSecretKey = getEnvVariable('FAUCET_RECAPTCHA_SECRET_KEY');

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

deployAwsAlbController(cluster)

const periodicCategory = "Periodic Teztnets";
const longCategory = "Long-Running Teztnets";

// chains
const dailynet_chain = new TezosChain(
    new TezosChainParametersBuilder({
        yamlFile: 'mondaynet/values.yaml',
        dnsName: 'dailynet',
        category: periodicCategory,
        humanName: 'Dailynet',
        description: 'A testnet that restarts every day launched from tezos/tezos master branch and protocol alpha.',
        schedule: '0 0 * * *',
        bootstrapContracts: ['taquito1.json'],
        chartRepo: 'mondaynet/tezos-k8s',
        privateBakingKey: private_baking_key,
        privateNonbakingKey: private_non_baking_key,
        numberOfFaucetAccounts: 1000,
        faucetSeed: faucetSeed,
        faucetRecaptchaSiteKey: faucetRecaptchaSiteKey,
        faucetRecaptchaSecretKey: faucetRecaptchaSecretKey,
    }),
    cluster.provider, repo);

const mondaynet_chain = new TezosChain(
    new TezosChainParametersBuilder({
        yamlFile: 'mondaynet/values.yaml',
        dnsName: 'mondaynet',
        category: periodicCategory,
        humanName: 'Mondaynet',
        description: 'A testnet that restarts every Monday launched from tezos/tezos master branch and protocol alpha.',
        schedule: '0 0 * * MON',
        bootstrapContracts: ['taquito1.json'],
        bootstrapCommitments: 'commitments.json',
        chartRepo: 'mondaynet/tezos-k8s',
        privateBakingKey: private_baking_key,
        privateNonbakingKey: private_non_baking_key,
        numberOfFaucetAccounts: 0,
        faucetSeed: faucetSeed,
        faucetRecaptchaSiteKey: faucetRecaptchaSiteKey,
        faucetRecaptchaSecretKey: faucetRecaptchaSecretKey,
    }),
    cluster.provider, repo);

const florencenet_chain = new TezosChain(
    new TezosChainParametersBuilder({
        yamlFile: "florencenet/values.yaml",
        name: 'florencenet',
        dnsName: 'florencenoba',
        category: longCategory,
        humanName: "Florencenet",
        description: 'Long-running test network for the Florence protocol.',
        bootstrapPeers: [
            'florencenobanet.smartpy.io:9733',
            'florencenobanet.tezos.co.il',
            'florencenobanet.kaml.fr',
            'florencenobanet.boot.tez.ie',
        ],
        bootstrapCommitments: 'commitments.json',
        chartRepo: 'florencenet/tezos-k8s',
        privateBakingKey: private_baking_key,
        privateNonbakingKey: private_non_baking_key,
        numberOfFaucetAccounts: 0,
        faucetSeed: faucetSeed,
        faucetRecaptchaSiteKey: faucetRecaptchaSiteKey,
        faucetRecaptchaSecretKey: faucetRecaptchaSecretKey,
    }),
    cluster.provider, repo);

const granadanet_chain = new TezosChain(
    new TezosChainParametersBuilder({
        yamlFile: "granadanet/values.yaml",
        name: 'granadanet',
        category: longCategory,
        humanName: "Granadanet",
        description: 'Long-running testnet for Granada proposal.',
        bootstrapPeers: [
            'granadanet.smartpy.io',
            'granadanet.tezos.co.il',
            'granadanet.kaml.fr',
        ],
        chartRepo: 'granadanet/tezos-k8s',
        privateBakingKey: private_baking_key,
        privateNonbakingKey: private_non_baking_key,
        numberOfFaucetAccounts: 0,
        faucetSeed: faucetSeed,
        faucetRecaptchaSiteKey: faucetRecaptchaSiteKey,
        faucetRecaptchaSecretKey: faucetRecaptchaSecretKey,
    }),
    cluster.provider, repo);


function getNetworks(chains: TezosChain[]): object {
    const networks: {[name: string]: object} = {};

    chains.forEach(function (chain) {
        const bootstrapPeers: string[] = Object.assign([], chain.params.getPeers()); // clone
        bootstrapPeers.splice(0, 0, `${chain.params.getDnsName()}.tznode.net`);
    
        // genesis_pubkey is the public key associated with the $TEZOS_BAKING_KEY private key in github secrets
        // TODO: generate it dynamically based on privkey
        const genesisPubkey = "edpkuix6Lv8vnrz6uDe1w8uaXY7YktitAxn6EHdy2jdzq5n5hZo94n";

        const network = Object.assign({}, chain.params.helmValues["node_config_network"]); // clone
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
        
        networks[chain.params.getName()] = network;
    })

    return networks;
}

function getTeztnets(chains: TezosChain[]): object {
    const teztnets: {[name: string]: {[name: string]: Object}} = {};

    chains.forEach(function (chain) {
        teztnets[chain.params.getCategory()] = teztnets[chain.params.getCategory()] || {};
        //
        // if no faucet accounts are generated, assume that we are using the legacy global faucet
        let faucetUrl = "https://faucet.tzalpha.net";
        if (chain.params.getNumberOfFaucetAccounts() > 0) {
            faucetUrl = `https://faucet.${chain.params.getName()}.teztnets.xyz`;
        }
        teztnets[chain.params.getCategory()][chain.params.getName()] = {
            chain_name: chain.getChainName(),
            network_url: chain.getNetworkUrl(),
            human_name: chain.params.getHumanName(),
            description: chain.getDescription(),
            docker_build: chain.getDockerBuild(),
            command: chain.getCommand(),
            faucet_url: faucetUrl
        };
    })

    return teztnets;
}

export const networks = getNetworks([dailynet_chain, mondaynet_chain, florencenet_chain, granadanet_chain]);
export const teztnets = getTeztnets([dailynet_chain, mondaynet_chain, florencenet_chain, granadanet_chain]);
