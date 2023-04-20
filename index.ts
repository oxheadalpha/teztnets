import * as pulumi from "@pulumi/pulumi"
import * as eks from "@pulumi/eks"
import * as k8s from "@pulumi/kubernetes"
import * as awsx from "@pulumi/awsx"
import * as aws from "@pulumi/aws"
var blake2b = require('blake2b');
const bs58check = require('bs58check');

require('dotenv').config();

import deployAwsAlbController from "./awsAlbController"
import deployExternalDns from "./externalDns"
import { TezosChain, TezosChainParametersBuilder } from "./TezosChain"
import { createCertValidation } from "./route53";

let stack = pulumi.getStack()
const cfg = new pulumi.Config()
const faucetPrivateKey = cfg.requireSecret("faucet-private-key")
const faucetRecaptchaSiteKey = cfg.requireSecret("faucet-recaptcha-site-key")
const faucetRecaptchaSecretKey = cfg.requireSecret("faucet-recaptcha-secret-key")

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
const private_oxhead_baking_key = getEnvVariable("PRIVATE_OXHEAD_BAKING_KEY")
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

const kubeAdminRoleARN = "arn:aws:iam::${aws_account_id}:role/tempKubernetesAdmin"
const cluster = new eks.Cluster(stack, {
  instanceType: "t3.2xlarge",
  desiredCapacity: desiredClusterCapacity,
  minSize: 1,
  maxSize: 5,
  providerCredentialOpts: {
    profileName: aws.config.profile,
  },
  roleMappings: [
    {
      groups: ["system:masters"],
      roleArn: kubeAdminRoleARN,
      username: "admin",
    },
  ],
  vpcId: vpc.id,
  publicSubnetIds: vpc.publicSubnetIds,
  privateSubnetIds: vpc.privateSubnetIds,
})

const teztnetsHostedZone = new aws.route53.Zone("teztnets.xyz", {
  comment: "Teztnets Hosted Zone",
  forceDestroy: false,
  name: "teztnets.xyz",
})

/**
 * Top level A records points to github pages
 * see: "configure an apex domain"
 * https://docs.github.com/en/pages/configuring-a-custom-domain-for-your-github-pages-site/managing-a-custom-domain-for-your-github-pages-site
 */
const teztnetsRootRecords = new aws.route53.Record("teztnetsRootRecords", {
  zoneId: teztnetsHostedZone.zoneId,
  name: "teztnets.xyz",
  type: "A",
  ttl: 300,
  records: [
    "185.199.108.153",
    "185.199.109.153",
    "185.199.110.153",
    "185.199.111.153",
  ],
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
    faucetYamlFile: "dailynet/faucet_values.yaml",
    faucetPrivateKey: faucetPrivateKey,
    faucetRecaptchaSiteKey: faucetRecaptchaSiteKey,
    faucetRecaptchaSecretKey: faucetRecaptchaSecretKey,
    dnsName: "dailynet",
    category: periodicCategory,
    humanName: "Dailynet",
    description:
      "A testnet that restarts every day launched from tezos/tezos master branch and protocol alpha.",
    schedule: "0 0 * * *",
    bootstrapContracts: ["taquito_big_map_contract.json", "taquito_contract.json", "taquito_sapling_contract.json", "taquito_tzip_12_16_contract.json"],
    chartRepo: "https://oxheadalpha.github.io/tezos-helm-charts/",
    chartRepoVersion: "6.18.0",
    privateBakingKey: private_oxhead_baking_key,
  }),
  cluster.provider,
  repo,
  teztnetsHostedZone,
)

const mondaynet_chain = new TezosChain(
  new TezosChainParametersBuilder({
    yamlFile: "mondaynet/values.yaml",
    faucetYamlFile: "mondaynet/faucet_values.yaml",
    faucetPrivateKey: faucetPrivateKey,
    faucetRecaptchaSiteKey: faucetRecaptchaSiteKey,
    faucetRecaptchaSecretKey: faucetRecaptchaSecretKey,
    dnsName: "mondaynet",
    category: periodicCategory,
    humanName: "Mondaynet",
    description:
      "A testnet that restarts every Monday launched from tezos/tezos master branch. It runs Mumbai for 8 cycles then upgrades to proto Alpha.",
    schedule: "0 0 * * MON",
    bootstrapPeers: [
      "mondaynet.ecadinfra.com",
    ],
    bootstrapContracts: ["taquito_big_map_contract.json", "taquito_contract.json", "taquito_sapling_contract.json", "taquito_tzip_12_16_contract.json"],
    chartRepo: "https://oxheadalpha.github.io/tezos-helm-charts/",
    chartRepoVersion: "6.18.0",
    privateBakingKey: private_oxhead_baking_key,
  }),
  cluster.provider,
  repo,
  teztnetsHostedZone,
)

// For ghostnet, we only deploy a faucet.
// The RPC service and baker are in the sensitive infra.
new TezosChain(
  new TezosChainParametersBuilder({
    faucetYamlFile: "ghostnet/faucet_values.yaml",
    faucetPrivateKey: faucetPrivateKey,
    faucetRecaptchaSiteKey: faucetRecaptchaSiteKey,
    faucetRecaptchaSecretKey: faucetRecaptchaSecretKey,
    name: "ghostnet",
    dnsName: "ghostnet",
    humanName: "Ghostnet",
    chartRepo: "https://oxheadalpha.github.io/tezos-helm-charts/",
    chartRepoVersion: "6.18.0",
  }),
  cluster.provider,
  repo,
  teztnetsHostedZone,
)

const mumbainet_chain = new TezosChain(
  new TezosChainParametersBuilder({
    yamlFile: "mumbainet/values.yaml",
    faucetYamlFile: "mumbainet/faucet_values.yaml",
    faucetPrivateKey: faucetPrivateKey,
    faucetRecaptchaSiteKey: faucetRecaptchaSiteKey,
    faucetRecaptchaSecretKey: faucetRecaptchaSecretKey,
    name: "mumbainet",
    dnsName: "mumbainet",
    category: protocolCategory,
    humanName: "Mumbainet",
    description: "Test Chain for the Mumbai2 Protocol Proposal",
    bootstrapPeers: [
      // "mumbainet.visualtez.com",
      "mumbainet.boot.ecadinfra.com",
      //"mumbainet.tzboot.net",
      // "mumbainet.stakenow.de:9733",
    ],
    chartRepo: "https://oxheadalpha.github.io/tezos-helm-charts/",
    chartRepoVersion: "6.18.0",
    privateBakingKey: private_oxhead_baking_key,
    indexers: [
      {
        name: "TzKT",
        url: "https://mumbainet.tzkt.io"
      },
      {
        "name": "TzStats",
        "url": "https://mumbai.tzstats.com"
      }
    ],
    rpcUrls: [
      "https://mumbainet.ecadinfra.com",
    ]
  }),
  cluster.provider,
  repo,
  teztnetsHostedZone,
)

const nairobinet_chain = new TezosChain(
  new TezosChainParametersBuilder({
    yamlFile: "nairobinet/values.yaml",
    faucetYamlFile: "nairobinet/faucet_values.yaml",
    faucetPrivateKey: faucetPrivateKey,
    faucetRecaptchaSiteKey: faucetRecaptchaSiteKey,
    faucetRecaptchaSecretKey: faucetRecaptchaSecretKey,
    name: "nairobinet",
    dnsName: "nairobinet",
    category: protocolCategory,
    humanName: "Nairobinet",
    description: "NOT LAUNCHED YET - Test Chain for the Nairobi Protocol Proposal",
    bootstrapPeers: [
      // "nairobinet.visualtez.com",
      "nairobinet.boot.ecadinfra.com",
      //"nairobinet.tzboot.net",
      // "nairobinet.stakenow.de:9733",
    ],
    chartRepo: "https://oxheadalpha.github.io/tezos-helm-charts/",
    chartRepoVersion: "6.19.1",
    privateBakingKey: private_oxhead_baking_key,
    indexers: [
    ],
    rpcUrls: [
    ]
  }),
  cluster.provider,
  repo,
  teztnetsHostedZone,
)

function getNetworks(chains: TezosChain[]): object {
  const networks: { [name: string]: object } = {}

  chains.forEach(function(chain) {
    const bootstrapPeers: string[] = Object.assign([], chain.params.getPeers()) // clone
    bootstrapPeers.splice(0, 0, `${chain.params.getName()}.teztnets.xyz`)

    // genesis_pubkey is the public key associated with the $TEZOS_OXHEAD_BAKING_KEY private key in github secrets
    // TODO: generate it dynamically based on privkey
    let genesisPubkey: string = "edpkuYLienS3Xdt5c1vfRX1ibMxQuvfM67ByhJ9nmRYYKGAAoTq1UC"
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
    if ("genesis" in network && "block" in network["genesis"] === false) {
      // If block hash not passed, use tezos-k8s convention:
      // deterministically derive it from chain name.
      var input = Buffer.from(network["chain_name"])
      var gbk = blake2b(32).update(input).digest('hex');
      var bytes = Buffer.from('0134' + gbk, 'hex')
      network["genesis"]["block"] = bs58check.encode(bytes);
    }

    networks[chain.params.getName()] = network
  })

  return networks
}

function getTeztnets(chains: TezosChain[]): object {
  const teztnets: { [name: string]: { [name: string]: Object } } = {}

  chains.forEach(function(chain) {
    let faucetUrl = `https://faucet.${chain.params.getName()}.teztnets.xyz`
    teztnets[chain.params.getName()] = {
      chain_name: chain.getChainName(),
      network_url: chain.getNetworkUrl(),
      human_name: chain.params.getHumanName(),
      description: chain.getDescription(),
      docker_build: chain.getDockerBuild(),
      git_ref: chain.getGitRef(),
      last_baking_daemon: chain.getLastBakingDaemon(),
      faucet_url: faucetUrl,
      category: chain.params.getCategory(),
      rpc_url: chain.getRpcUrl(),
      rpc_urls: chain.getRpcUrls(),
      masked_from_main_page: chain.params.isMaskedFromMainPage(),
      aliases: chain.params.getAliases(),
      indexers: chain.params.getIndexers(),
    }
  })

  return teztnets
}

// We do not host a ghostnet node here.
// Oxhead Alpha hosts a ghostnet RPC service and baker in the
// sensitive infra cluster.
// Instead, we hardcode the values to be displayed on the webpage.
let ghostnetNetwork = {
  "chain_name": "TEZOS_ITHACANET_2022-01-25T15:00:00Z",
  "default_bootstrap_peers": [
    "ghostnet.teztnets.xyz",
    "ghostnet.boot.ecadinfra.com",
    "ghostnet.stakenow.de:9733",
  ],
  "genesis": {
    "block": "BLockGenesisGenesisGenesisGenesisGenesis1db77eJNeJ9",
    "protocol": "Ps9mPmXaRzmzk35gbAYNCAw6UXdE2qoABTHbN2oEEc1qM7CwT9P",
    "timestamp": "2022-01-25T15:00:00Z"
  },
  "genesis_parameters": {
    "values": {
      "genesis_pubkey": "edpkuYLienS3Xdt5c1vfRX1ibMxQuvfM67ByhJ9nmRYYKGAAoTq1UC"
    }
  },
  "sandboxed_chain_name": "SANDBOXED_TEZOS",
  "user_activated_upgrades": [
    {
      "level": 8191,
      "replacement_protocol": "Psithaca2MLRFYargivpo7YvUr7wUDqyxrdhC5CQq78mRvimz6A"
    },
    {
      "level": 765952,
      "replacement_protocol": "PtJakart2xVj7pYXJBXrqHgd82rdkLey5ZeeGwDgPp9rhQUbSqY"
    },
    {
      "level": 1191936,
      "replacement_protocol": "PtKathmankSpLLDALzWw7CGD2j2MtyveTwboEYokqUCP4a1LxMg"
    },
    {
      "level": 1654784,
      "replacement_protocol": "PtLimaPtLMwfNinJi9rCfDPWea8dFgTZ1MeJ9f1m2SRic6ayiwW"
    }
  ]
}
export const networks = {
  ...getNetworks([
    dailynet_chain,
    mondaynet_chain,
    mumbainet_chain,
    nairobinet_chain,
  ]),
  ...{ "ghostnet": ghostnetNetwork }
}

// We do not host a ghostnet node here.
// Oxhead Alpha hosts a ghostnet RPC service and baker in the
// sensitive infra cluster.
// Instead, we hardcode the values to be displayed on the webpage.
let gitRefMainnetGhostnet = "v16.1";
let lastBakingDaemonMainnetGhostnet = "PtMumbai";
let ghostnetTeztnet = {
  "aliases": [
    "ithacanet"
  ],
  "category": "Long-running Teztnets",
  "chain_name": "TEZOS_ITHACANET_2022-01-25T15:00:00Z",
  "description": "Ghostnet is the long-running testnet for Tezos.",
  "docker_build": `tezos/tezos:${gitRefMainnetGhostnet}`,
  "faucet_url": "https://faucet.ghostnet.teztnets.xyz",
  "git_ref": gitRefMainnetGhostnet,
  "human_name": "Ghostnet",
  "indexers": [
    {
      "name": "TzKT",
      "url": "https://ghostnet.tzkt.io"
    },
    {
      "name": "TzStats",
      "url": "https://ghost.tzstats.com"
    }
  ],
  "last_baking_daemon": lastBakingDaemonMainnetGhostnet,
  "masked_from_main_page": false,
  "network_url": "https://teztnets.xyz/ghostnet",
  "rpc_url": "https://rpc.ghostnet.teztnets.xyz",
  "rpc_urls": [
    "https://rpc.ghostnet.teztnets.xyz",
    "https://ghostnet.ecadinfra.com",
    "https://ghostnet.tezos.marigold.dev",
  ]
}

// We also add mainnet to the teztnets metadata.
// Some systems rely on this to provide lists of third-party RPC services
// to their users. For example, umami wallet.
let mainnetTeztnet = {
  "aliases": [],
  "category": "Long-running Teztnets",
  "chain_name": "TEZOS_MAINNET",
  "description": "Tezos Mainnet",
  "docker_build": `tezos/tezos:${gitRefMainnetGhostnet}`,
  "git_ref": gitRefMainnetGhostnet,
  "human_name": "Mainnet",
  "indexers": [
    {
      "name": "TzKT",
      "url": "https://tzkt.io"
    },
    {
      "name": "TzStats",
      "url": "https://tzstats.com"
    }
  ],
  "last_baking_daemon": lastBakingDaemonMainnetGhostnet,
  "masked_from_main_page": true,
  "rpc_url": "https://mainnet.oxheadhosted.com",
  "rpc_urls": [
    "https://mainnet.oxheadhosted.com",
    "https://mainnet.api.tez.ie",
    "https://mainnet.smartpy.io",
    "https://mainnet.tezos.marigold.dev",
  ]
}

export const teztnets = {
  ...getTeztnets([
    dailynet_chain,
    mondaynet_chain,
    mumbainet_chain,
    nairobinet_chain,
  ]),
  ...{ "ghostnet": ghostnetTeztnet, "mainnet": mainnetTeztnet }
}

const pyrometerDomain = "status.teztnets.xyz"
const pyrometerCert = new aws.acm.Certificate(
  `${pyrometerDomain}-cert`,
  {
    validationMethod: "DNS",
    domainName: pyrometerDomain,
  },
)
createCertValidation(
  {
    cert: pyrometerCert,
    targetDomain: pyrometerDomain,
    hostedZone: teztnetsHostedZone
  },
)

new k8s.helm.v2.Chart(
  "pyrometer",
  {
    chart: 'pyrometer',
    version: "6.17.0",
    fetchOpts:
    {
      repo: "https://oxheadalpha.github.io/tezos-helm-charts/",
    },
    values: {
      config: {
        "node_monitor": {
          "nodes": Object.keys(networks).filter(n => n != "ghostnet").map(network => "http://tezos-node-rpc." + network + ":8732"),
        },
        "ui": {
          "enabled": true,
          "host": "0.0.0.0",
          "port": 80,
        },
        "log": {
          "level": "info",
          "timestamp": false
        }
      },
      ingress: {
        enabled: true,
        annotations: {
          "kubernetes.io/ingress.class": "alb",
          "alb.ingress.kubernetes.io/scheme": "internet-facing",
          "alb.ingress.kubernetes.io/healthcheck-path": "/",
          "alb.ingress.kubernetes.io/healthcheck-port": "80",
          "alb.ingress.kubernetes.io/listen-ports": '[{"HTTP": 80}, {"HTTPS":443}]',
          "ingress.kubernetes.io/force-ssl-redirect": "true",
          "alb.ingress.kubernetes.io/actions.ssl-redirect":
            '{"type": "redirect", "redirectconfig": { "protocol": "https", "port": "443", "statuscode": "http_301"}}',
        },
        host: pyrometerDomain,
      }
    }
  },
  { providers: { kubernetes: cluster.provider } }
);
