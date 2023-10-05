import * as pulumi from "@pulumi/pulumi"
import * as digitalocean from "@pulumi/digitalocean"
import * as k8s from "@pulumi/kubernetes"
import * as blake2b from "blake2b"
import * as bs58check from "bs58check"

import deployPyrometer from "./pyrometer"
import { TezosChain, TezosChainParametersBuilder } from "./TezosChain"

const cfg = new pulumi.Config()
const faucetPrivateKey = cfg.requireSecret("faucet-private-key")
const faucetRecaptchaSiteKey = cfg.requireSecret("faucet-recaptcha-site-key")
const faucetRecaptchaSecretKey = cfg.requireSecret(
  "faucet-recaptcha-secret-key"
)
const private_oxhead_baking_key = cfg.requireSecret("private-teztnets-baking-key")

const stackRef = new pulumi.StackReference(`tqtezos/oxheadinfra_do/dev`)

const kubeconfig = stackRef.requireOutput("kubeconfig")

const doCfg = new pulumi.Config("digitalocean")

const doToken = doCfg.requireSecret("token");

const provider = new k8s.Provider("do-k8s-provider", {
  kubeconfig
})

// Deploy a bucket to store activation smart contracts for all testnets
const activationBucket = new digitalocean.SpacesBucket("teztnets-global-activation-bucket", { acl: "public-read" })

const periodicCategory = "Periodic Teztnets"
const protocolCategory = "Protocol Teztnets"
const longCategory = "Long-running Teztnets"

const teztnetsDomain = new digitalocean.Domain("teztnets.xyz", {
  name: "teztnets.xyz",
});
/**
 * Top level A records points to github pages
 * see: "configure an apex domain"
 * https://docs.github.com/en/pages/configuring-a-custom-domain-for-your-github-pages-site/managing-a-custom-domain-for-your-github-pages-site
 */
[
  "185.199.108.153",
  "185.199.109.153",
  "185.199.110.153",
  "185.199.111.153",
].forEach((v) => {
  new digitalocean.DnsRecord(`teztnetsSiteRecord-${v}`, {
    domain: teztnetsDomain.name,
    name: "teztnets.xyz",
    type: "A",
    ttl: 300,
    value: v
  })

})
// chains
const dailynet_chain = new TezosChain(
  new TezosChainParametersBuilder({
    yamlFile: "networks/dailynet/values.yaml",
    faucetYamlFile: "networks/dailynet/faucet_values.yaml",
    faucetPrivateKey: faucetPrivateKey,
    faucetRecaptchaSiteKey: faucetRecaptchaSiteKey,
    faucetRecaptchaSecretKey: faucetRecaptchaSecretKey,
    dnsName: "dailynet",
    category: periodicCategory,
    humanName: "Dailynet",
    description:
      "A testnet that restarts every day launched from tezos/tezos master branch and protocol alpha.",
    schedule: "0 0 * * *",
    bootstrapContracts: [
      "taquito_big_map_contract.json",
      "taquito_contract.json",
      "taquito_sapling_contract.json",
      "taquito_tzip_12_16_contract.json",
      "evm_bridge.json",
      "exchanger.json",
    ],
    // chartRepoVersion: "6.18.0",
    chartPath: "networks/dailynet/tezos-k8s",
    privateBakingKey: private_oxhead_baking_key,
    activationBucket: activationBucket,
  }),
  provider,
)

const mondaynet_chain = new TezosChain(
  new TezosChainParametersBuilder({
    yamlFile: "networks/mondaynet/values.yaml",
    faucetYamlFile: "networks/mondaynet/faucet_values.yaml",
    faucetPrivateKey: faucetPrivateKey,
    faucetRecaptchaSiteKey: faucetRecaptchaSiteKey,
    faucetRecaptchaSecretKey: faucetRecaptchaSecretKey,
    dnsName: "mondaynet",
    category: periodicCategory,
    humanName: "Mondaynet",
    description:
      "A testnet that restarts every Monday launched from tezos/tezos master branch. It runs Oxford for 8 cycles then upgrades to proto Alpha.",
    schedule: "0 0 * * MON",
    bootstrapPeers: ["mondaynet.ecadinfra.com"],
    bootstrapContracts: [
      "taquito_big_map_contract.json",
      "taquito_contract.json",
      "taquito_sapling_contract.json",
      "taquito_tzip_12_16_contract.json",
      "exchanger.json",
      "evm_bridge.json",
    ],
    // chartRepoVersion: "6.18.0",
    chartPath: "networks/dailynet/tezos-k8s", // Using dal node code in dailynet submod
    privateBakingKey: private_oxhead_baking_key,
    activationBucket: activationBucket,
  }),
  provider,
)

// For ghostnet, we only deploy a faucet.
// The RPC service and baker are in the sensitive infra.
new TezosChain(
  new TezosChainParametersBuilder({
    faucetYamlFile: "networks/ghostnet/faucet_values.yaml",
    faucetPrivateKey: faucetPrivateKey,
    faucetRecaptchaSiteKey: faucetRecaptchaSiteKey,
    faucetRecaptchaSecretKey: faucetRecaptchaSecretKey,
    name: "ghostnet",
    dnsName: "ghostnet",
    humanName: "Ghostnet",
    chartRepoVersion: "6.22.0",
  }),
  provider,
)

const nairobinet_chain = new TezosChain(
  new TezosChainParametersBuilder({
    yamlFile: "networks/nairobinet/values.yaml",
    faucetYamlFile: "networks/nairobinet/faucet_values.yaml",
    faucetPrivateKey: faucetPrivateKey,
    faucetRecaptchaSiteKey: faucetRecaptchaSiteKey,
    faucetRecaptchaSecretKey: faucetRecaptchaSecretKey,
    name: "nairobinet",
    dnsName: "nairobinet",
    category: protocolCategory,
    humanName: "Nairobinet",
    description: "Test Chain for the Nairobi Protocol Proposal",
    bootstrapPeers: ["nairobinet.boot.ecadinfra.com", "nairobinet.tzboot.net"],
    chartRepoVersion: "6.22.0",
    privateBakingKey: private_oxhead_baking_key,
    indexers: [
      {
        name: "TzKT",
        url: "https://nairobinet.tzkt.io",
      },
      {
        name: "TzStats",
        url: "https://nairobi.tzstats.com",
      },
    ],
    rpcUrls: ["https://nairobinet.ecadinfra.com"],
    activationBucket: activationBucket,
  }),
  provider,
)

function getNetworks(chains: TezosChain[]): object {
  const networks: { [name: string]: object } = {}

  chains.forEach(function(chain) {
    const bootstrapPeers: string[] = Object.assign([], chain.params.getPeers()) // clone
    bootstrapPeers.splice(0, 0, `${chain.params.getName()}.teztnets.xyz`)

    // genesis_pubkey is the public key associated with the $TEZOS_OXHEAD_BAKING_KEY private key in github secrets
    // TODO: generate it dynamically based on privkey
    let genesisPubkey: string =
      "edpkuYLienS3Xdt5c1vfRX1ibMxQuvfM67ByhJ9nmRYYKGAAoTq1UC"
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
      var gbk = blake2b(32).update(input).digest("hex")
      var bytes = Buffer.from("0134" + gbk, "hex")
      network["genesis"]["block"] = bs58check.encode(bytes)
    }
    if ("dal_config" in network) {
      network["dal_config"]["bootstrap_peers"] = [
        `dal.${chain.params.getName()}.teztnets.xyz:11732`,
      ]
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
      rollup_urls: chain.getRollupUrls(),
      evm_proxy_urls: chain.getEvmProxyUrls(),
      dal_p2p_url: chain.getDalP2pUrl()!,
      dal_rpc_url: chain.getDalRpcUrl()!,
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
const ghostnetNetwork = {
  chain_name: "TEZOS_ITHACANET_2022-01-25T15:00:00Z",
  default_bootstrap_peers: [
    "ghostnet.teztnets.xyz",
    "ghostnet.boot.ecadinfra.com",
    "ghostnet.stakenow.de:9733",
  ],
  genesis: {
    block: "BLockGenesisGenesisGenesisGenesisGenesis1db77eJNeJ9",
    protocol: "Ps9mPmXaRzmzk35gbAYNCAw6UXdE2qoABTHbN2oEEc1qM7CwT9P",
    timestamp: "2022-01-25T15:00:00Z",
  },
  genesis_parameters: {
    values: {
      genesis_pubkey: "edpkuYLienS3Xdt5c1vfRX1ibMxQuvfM67ByhJ9nmRYYKGAAoTq1UC",
    },
  },
  sandboxed_chain_name: "SANDBOXED_TEZOS",
  user_activated_upgrades: [
    {
      level: 8191,
      replacement_protocol:
        "Psithaca2MLRFYargivpo7YvUr7wUDqyxrdhC5CQq78mRvimz6A",
    },
    {
      level: 765952,
      replacement_protocol:
        "PtJakart2xVj7pYXJBXrqHgd82rdkLey5ZeeGwDgPp9rhQUbSqY",
    },
    {
      level: 1191936,
      replacement_protocol:
        "PtKathmankSpLLDALzWw7CGD2j2MtyveTwboEYokqUCP4a1LxMg",
    },
    {
      level: 1654784,
      replacement_protocol:
        "PtLimaPtLMwfNinJi9rCfDPWea8dFgTZ1MeJ9f1m2SRic6ayiwW",
    },
  ],
}

export const networks = {
  ...getNetworks([
    dailynet_chain,
    mondaynet_chain,
    nairobinet_chain,
  ]),
  ...{ ghostnet: ghostnetNetwork },
}

// We do not host a ghostnet node here.
// Oxhead Alpha hosts a ghostnet RPC service and baker in the
// sensitive infra cluster.
// Instead, we hardcode the values to be displayed on the webpage.
const gitRefMainnetGhostnet = "v17.3"
const lastBakingDaemonMainnetGhostnet = "PtNairob"
const ghostnetTeztnet = {
  aliases: ["ithacanet"],
  category: "Long-running Teztnets",
  chain_name: "TEZOS_ITHACANET_2022-01-25T15:00:00Z",
  description: "Ghostnet is the long-running testnet for Tezos.",
  docker_build: `tezos/tezos:${gitRefMainnetGhostnet}`,
  faucet_url: "https://faucet.ghostnet.teztnets.xyz",
  git_ref: gitRefMainnetGhostnet,
  human_name: "Ghostnet",
  indexers: [
    {
      name: "TzKT",
      url: "https://ghostnet.tzkt.io",
    },
    {
      name: "TzStats",
      url: "https://ghost.tzstats.com",
    },
  ],
  last_baking_daemon: lastBakingDaemonMainnetGhostnet,
  masked_from_main_page: false,
  network_url: "https://teztnets.xyz/ghostnet",
  rpc_url: "https://rpc.ghostnet.teztnets.xyz",
  rpc_urls: [
    "https://rpc.ghostnet.teztnets.xyz",
    "https://ghostnet.ecadinfra.com",
    "https://ghostnet.tezos.marigold.dev",
  ],
}

// We also add mainnet to the teztnets metadata.
// Some systems rely on this to provide lists of third-party RPC services
// to their users. For example, umami wallet.
const mainnetMetadata = {
  aliases: [],
  category: "Long-running Teztnets",
  chain_name: "TEZOS_MAINNET",
  description: "Tezos Mainnet",
  docker_build: `tezos/tezos:${gitRefMainnetGhostnet}`,
  git_ref: gitRefMainnetGhostnet,
  human_name: "Mainnet",
  indexers: [
    {
      name: "TzKT",
      url: "https://tzkt.io",
    },
    {
      name: "TzStats",
      url: "https://tzstats.com",
    },
  ],
  last_baking_daemon: lastBakingDaemonMainnetGhostnet,
  masked_from_main_page: true,
  rpc_url: "https://mainnet.oxheadhosted.com",
  rpc_urls: [
    "https://mainnet.oxheadhosted.com",
    "https://mainnet.api.tez.ie",
    "https://mainnet.smartpy.io",
    "https://mainnet.tezos.marigold.dev",
  ],
}

export const teztnets = {
  ...getTeztnets([
    dailynet_chain,
    mondaynet_chain,
    nairobinet_chain,
  ]),
  ...{ ghostnet: ghostnetTeztnet, mainnet: mainnetMetadata },
}

deployPyrometer({ provider, networks })
