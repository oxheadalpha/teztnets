import * as pulumi from "@pulumi/pulumi"
import * as eks from "@pulumi/eks"
import * as k8s from "@pulumi/kubernetes"
import * as awsx from "@pulumi/awsx"
import * as aws from "@pulumi/aws"

import deployAwsAlbController from "./awsAlbController"
import deployExternalDns from "./externalDns"
import { TezosChain, TezosChainParametersBuilder } from "./TezosChain"

let stack = pulumi.getStack()

// Function to fail on non-truthy variable.
const getEnvVariable = (name: string): string => {
  const env = process.env[name]
  if (!env) {
    pulumi.log.error(`${name} environment variable is not set`)
    throw Error
  }
  return env
}

const repo = new awsx.ecr.Repository(stack)

const desiredClusterCapacity = 2
const aws_account_id = getEnvVariable("AWS_ACCOUNT_ID")
const private_oxhead_baking_key = getEnvVariable("PRIVATE_OXHEAD_BAKING_KEY")
const private_baking_key = getEnvVariable("PRIVATE_BAKING_KEY")
const private_non_baking_key = getEnvVariable("PRIVATE_NON_BAKING_KEY")
const faucetSeed = getEnvVariable("FAUCET_SEED")
const faucetRecaptchaSiteKey = getEnvVariable("FAUCET_RECAPTCHA_SITE_KEY")
const faucetRecaptchaSecretKey = getEnvVariable("FAUCET_RECAPTCHA_SECRET_KEY")

// Create a VPC with subnets that are tagged for load balancer usage.
// See: https://github.com/pulumi/pulumi-eks/tree/master/examples/subnet-tags
const vpc = new awsx.ec2.Vpc(
  "vpc",
  {
    subnets: [
      // Tag subnets for specific load-balancer usage.
      // Any non-null tag value is valid.
      // See:
      //  - https://docs.aws.amazon.com/eks/latest/userguide/network_reqs.html
      //  - https://github.com/pulumi/pulumi-eks/issues/196
      //  - https://github.com/pulumi/pulumi-eks/issues/415
      { type: "public", tags: { "kubernetes.io/role/elb": "1" } },
      { type: "private", tags: { "kubernetes.io/role/internal-elb": "1" } },
    ],
  },
  {
    // Inform pulumi to ignore tag changes to the VPCs or subnets, so that
    // tags auto-added by AWS EKS do not get removed during future
    // refreshes and updates, as they are added outside of pulumi's management
    // and would be removed otherwise.
    // See: https://github.com/pulumi/pulumi-eks/issues/271#issuecomment-548452554
    transformations: [
      (args: any) => {
        if (
          args.type === "aws:ec2/vpc:Vpc" ||
          args.type === "aws:ec2/subnet:Subnet"
        ) {
          return {
            props: args.props,
            opts: pulumi.mergeOptions(args.opts, { ignoreChanges: ["tags"] }),
          }
        }
        return undefined
      },
    ],
  }
)

const cluster = new eks.Cluster(stack, {
  instanceType: "t3.2xlarge",
  desiredCapacity: desiredClusterCapacity,
  minSize: 1,
  maxSize: 5,
  providerCredentialOpts: {
    roleArn: `arn:aws:iam::${aws_account_id}:role/KubernetesAdmin`,
  },
  roleMappings: [
    {
      groups: ["system:masters"],
      roleArn: `arn:aws:iam::${aws_account_id}:role/KubernetesAdmin`,
      username: "admin",
    },
  ],
  vpcId: vpc.id,
  publicSubnetIds: vpc.publicSubnetIds,
  privateSubnetIds: vpc.privateSubnetIds,
})

// Export the cluster's kubeconfig.
export const kubeconfig = cluster.kubeconfig
export const clusterName = cluster.eksCluster.name
export const clusterNodeInstanceRoleName = cluster.instanceRoles.apply(
  (roles) => roles[0].name
)

deployAwsAlbController(cluster)
deployExternalDns(cluster)

const periodicCategory = "Periodic Teztnets"
const protocolCategory = "Protocol Teztnets"
const longCategory = "Long-running Teztnets"

// chains
const dailynet_chain = new TezosChain(
  new TezosChainParametersBuilder({
    yamlFile: "dailynet/values.yaml",
    dnsName: "dailynet",
    category: periodicCategory,
    humanName: "Dailynet",
    description:
      "A testnet that restarts every day launched from tezos/tezos master branch and protocol alpha.",
    schedule: "0 0 * * *",
    bootstrapContracts: ["taquito1.json"],
    chartRepo: "https://oxheadalpha.github.io/tezos-helm-charts/",
    chartRepoVersion: "5.3.4",
    privateBakingKey: private_oxhead_baking_key,
    numberOfFaucetAccounts: 1000,
    faucetSeed: faucetSeed,
    faucetRecaptchaSiteKey: faucetRecaptchaSiteKey,
    faucetRecaptchaSecretKey: faucetRecaptchaSecretKey,
  }),
  cluster.provider,
  repo
)

const mondaynet_chain = new TezosChain(
  new TezosChainParametersBuilder({
    yamlFile: "mondaynet/values.yaml",
    dnsName: "mondaynet",
    category: periodicCategory,
    humanName: "Mondaynet",
    description:
      "A testnet that restarts every Monday launched from tezos/tezos master branch and Hangzhou protocol, upgrading to alpha at block 255.",
    schedule: "0 0 * * MON",
    bootstrapContracts: ["taquito1.json"],
    chartRepo: "https://oxheadalpha.github.io/tezos-helm-charts/",
    chartRepoVersion: "5.3.4",
    privateBakingKey: private_oxhead_baking_key,
    numberOfFaucetAccounts: 1000,
    faucetSeed: faucetSeed,
    faucetRecaptchaSiteKey: faucetRecaptchaSiteKey,
    faucetRecaptchaSecretKey: faucetRecaptchaSecretKey,
  }),
  cluster.provider,
  repo
)

const kaizen_chain = new TezosChain(
  new TezosChainParametersBuilder({
    yamlFile: "kaizen/values.yaml",
    name: "kaizen",
    dnsName: "kaizen",
    category: longCategory,
    humanName: "Kaizen",
    description: "Long-running Tezos testnet that closely follows mainnet proto upgrades",
    bootstrapPeers: [
      "kaizen-boot.ecadinfra.com",
    ],
    chartRepo: "https://oxheadalpha.github.io/tezos-helm-charts/",
    chartRepoVersion: "5.3.4",
    privateBakingKey: private_baking_key,
    privateNonbakingKey: private_non_baking_key,
    numberOfFaucetAccounts: 0,
    faucetSeed: faucetSeed,
    faucetRecaptchaSiteKey: faucetRecaptchaSiteKey,
    faucetRecaptchaSecretKey: faucetRecaptchaSecretKey,
  }),
  cluster.provider,
  repo
)

const hangzhounet_chain = new TezosChain(
  new TezosChainParametersBuilder({
    yamlFile: "hangzhounet/values.yaml",
    name: "hangzhounet",
    dnsName: "hangzhounet",
    category: protocolCategory,
    humanName: "Hangzhounet",
    description: "Testnet for Hangzhou protocol proposal.",
    bootstrapPeers: [
      "hangzhounet.smartpy.io",
      "hangzhounet.tezos.co.il",
      "hangzhounet.kaml.fr",
      "hangzhounet.boot.tez.ie",
    ],
    chartRepo: "https://oxheadalpha.github.io/tezos-helm-charts/",
    chartRepoVersion: "5.3.4",
    privateBakingKey: private_oxhead_baking_key,
    numberOfFaucetAccounts: 10000,
    faucetSeed: faucetSeed,
    faucetRecaptchaSiteKey: faucetRecaptchaSiteKey,
    faucetRecaptchaSecretKey: faucetRecaptchaSecretKey,
  }),
  cluster.provider,
  repo
)

const idiazabalnet_chain = new TezosChain(
  new TezosChainParametersBuilder({
    yamlFile: "idiazabalnet/values.yaml",
    name: "idiazabalnet",
    dnsName: "idiazabalnet",
    category: protocolCategory,
    humanName: "Idiazabalnet",
    description: "Third iteration of testnet for future I proposal testing",
    bootstrapPeers: [
      "idiazabalnet.smartpy.io",
      "idiazabalnet.boot.ecadinfra.com",
      "idiazabalnet.kaml.fr",
    ],
    chartRepo: "https://oxheadalpha.github.io/tezos-helm-charts/",
    chartRepoVersion: "5.3.4",
    privateBakingKey: private_oxhead_baking_key,
    numberOfFaucetAccounts: 10000,
    faucetSeed: faucetSeed,
    faucetRecaptchaSiteKey: faucetRecaptchaSiteKey,
    faucetRecaptchaSecretKey: faucetRecaptchaSecretKey,
  }),
  cluster.provider,
  repo
)

function getNetworks(chains: TezosChain[]): object {
  const networks: { [name: string]: object } = {}

  chains.forEach(function (chain) {
    const bootstrapPeers: string[] = Object.assign([], chain.params.getPeers()) // clone
    bootstrapPeers.splice(0, 0, `${chain.params.getName()}.teztnets.xyz`)

    // genesis_pubkey is the public key associated with the $TEZOS_OXHEAD_BAKING_KEY private key in github secrets
    // TODO: generate it dynamically based on privkey
    let genesisPubkey: string
    if (
      chain.params.getName().includes("kaizen") ||
      chain.params.getName().includes("mondaynet")
    ) {
      // legacy tq key
      genesisPubkey = "edpkuix6Lv8vnrz6uDe1w8uaXY7YktitAxn6EHdy2jdzq5n5hZo94n"
    } else {
      // new oxhead key
      genesisPubkey = "edpkuYLienS3Xdt5c1vfRX1ibMxQuvfM67ByhJ9nmRYYKGAAoTq1UC"
    }
    const network = Object.assign(
      {},
      chain.params.helmValues["node_config_network"]
    ) // clone
    network["sandboxed_chain_name"] = "SANDBOXED_TEZOS"
    network["default_bootstrap_peers"] = bootstrapPeers
    network["genesis_parameters"] = {
      values: {
        genesis_pubkey: genesisPubkey,
      },
    }
    if ("activation_account_name" in network) {
      delete network["activation_account_name"]
    }

    networks[chain.params.getName()] = network
  })

  return networks
}

function getTeztnets(chains: TezosChain[]): object {
  const teztnets: { [name: string]: { [name: string]: Object } } = {}

  chains.forEach(function (chain) {
    const chainName = chain.params.getName()
    let faucetUrl

    if (chainName === "kaizen") {
      // legacy faucet
      faucetUrl = "https://faucet.tzalpha.net"
    } else {
      faucetUrl = `https://teztnets.xyz/${chain.params.getName()}-faucet`
    }
    let rpcUrl = `https://rpc.${chain.params.getName()}.teztnets.xyz`
    teztnets[chain.params.getName()] = {
      chain_name: chain.getChainName(),
      network_url: chain.getNetworkUrl(),
      human_name: chain.params.getHumanName(),
      description: chain.getDescription(),
      docker_build: chain.getDockerBuild(),
      protocols: chain.getProtocols(),
      last_baking_daemon: chain.getLastBakingDaemon(),
      faucet_url: faucetUrl,
      category: chain.params.getCategory(),
      rpc_url: rpcUrl,
      masked_from_main_page: chain.params.isMaskedFromMainPage(),
    }
  })

  return teztnets
}

export const networks = getNetworks([
  dailynet_chain,
  mondaynet_chain,
  kaizen_chain,
  hangzhounet_chain,
  idiazabalnet_chain,
])
export const teztnets = getTeztnets([
  dailynet_chain,
  mondaynet_chain,
  kaizen_chain,
  hangzhounet_chain,
  idiazabalnet_chain,
])
