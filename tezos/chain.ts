import * as gcp from "@pulumi/gcp"
import * as k8s from "@pulumi/kubernetes"
import * as pulumi from "@pulumi/pulumi"
import * as cronParser from "cron-parser"
import * as fs from "fs"
import * as YAML from "yaml"
const mime = require("mime")
import { getChartParams } from './chartResolver'
import { TezosImageResolver } from "./imageResolver"

export interface TezosParameters {
  readonly activationBucket: gcp.storage.Bucket
  readonly bootstrapContracts?: string[]
  readonly category: string
  readonly description: string
  readonly bakingPrivateKey: pulumi.Output<string>
  readonly humanName: string
  readonly indexers?: { name: string; url: string }[]
  readonly chartPath?: string
  readonly chartRepoVersion?: string
  readonly bootstrapPeers?: string[]
  readonly rpcUrls?: string[]
  readonly helmValuesFile: string
  readonly schedule?: string
}

/**
 * Deploy a tezos-k8s topology in a k8s cluster.
 * Supports either local charts or charts from a repo
 */

export class TezosChain extends pulumi.ComponentResource {
  readonly name: string
  readonly params: TezosParameters
  readonly tezosHelmValues: any
  readonly namespace: k8s.core.v1.Namespace

  /**
   * Deploys a private chain on a Kubernetes cluster.
   * @param name The name of the Pulumi resource.
   * @param params Helm chart values and chain bootstrap parameters
   * @param provider The Kubernetes cluster to deploy it into.
   */
  constructor(
    params: TezosParameters,
    provider: k8s.Provider,
    opts?: pulumi.ResourceOptions
  ) {
    const inputs: pulumi.Inputs = {
      options: opts,
    }

    let name: string;
    if (params.schedule) {
      const deployDate = new Date(
        cronParser
          .parseExpression(params.schedule, { utc: true })
          .prev()
          .toLocaleString()
      )
      name =
        `${params.humanName.toLowerCase()}-${
        deployDate.toISOString().split("T")[0]
        }`
    } else {
      name = params.humanName.toLowerCase()
    }
    super("pulumi-contrib:components:TezosChain", name, inputs, opts)

    this.params = params
    this.name = name

    this.tezosHelmValues = YAML.parse(
      fs.readFileSync(this.params.helmValuesFile, "utf8")
    );
    if (this.name == "nairobinet") {
      this.tezosHelmValues["accounts"]["oxheadbaker"]["key"] = this.params.bakingPrivateKey
    } else {
      this.tezosHelmValues["accounts"]["teztnetsbaker"]["key"] = this.params.bakingPrivateKey
    }
    if (this.params.schedule) {
      const deployDate = new Date(
        cronParser
          .parseExpression(this.params.schedule, { utc: true })
          .prev()
          .toLocaleString()
      )
      const imageResolver = new TezosImageResolver()
      this.tezosHelmValues["images"]["octez"] =
        pulumi
          .output(imageResolver.getLatestTagAsync(deployDate))
          .apply((tag) => `${imageResolver.image}:${tag}`)
      // this is a trick to change mondaynet's name when it needs to be respun.
      // if the chain has already launched but gets bricked because it can no longer upgrade from one proto to the next,
      // change the date below. It will start with a different chainId.
      // This way, it won't mix with the existing mondaynet and will be able to sync.
      // Otherwise, the old broken mondaynet will mix with the new one and you'll never be able to produce
      // another genesis block.
      this.tezosHelmValues["node_config_network"]["chain_name"] =
        `TEZOS-${this.params.humanName.toUpperCase()}-${deployDate.toISOString()}`
      this.tezosHelmValues["node_config_network"]["genesis"]["timestamp"] = deployDate.toISOString();
    }

    if (params.bootstrapContracts) {
      params.bootstrapContracts.forEach((contractFile) => {
        let contractFullName = `${name}-${contractFile}`;

        // Create a new GCP storage object
        new gcp.storage.BucketObject(contractFullName, {
          bucket: params.activationBucket.name,
          name: contractFullName,
          source: new pulumi.asset.FileAsset(`bootstrap_contracts/${contractFile}`),
          contentType: mime.getType(contractFile) || undefined,
        });

        // Push the URL to the helm values
        if (!this.tezosHelmValues["activation"]["bootstrap_contract_urls"]) {
          this.tezosHelmValues["activation"]["bootstrap_contract_urls"] = [];
        }
        this.tezosHelmValues["activation"]["bootstrap_contract_urls"].push(
          pulumi.interpolate`https://storage.googleapis.com/${params.activationBucket.name}/${contractFullName}`
        );
      });
    }

    this.namespace = new k8s.core.v1.Namespace(
      this.name,
      { metadata: { name: name } },
      { provider: provider }
    )


    // RPC Ingress
    const rpcDomain = `rpc.${name}.teztnets.xyz`

    const rpcIngName = `${rpcDomain}-ingress`
    new k8s.networking.v1.Ingress(
      rpcIngName,
      {
        metadata: {
          namespace: this.namespace.metadata.name,
          name: rpcIngName,
          annotations: {
            "kubernetes.io/ingress.class": "nginx",
            "cert-manager.io/cluster-issuer": "letsencrypt-prod",
            "nginx.ingress.kubernetes.io/enable-cors": "true",
            "nginx.ingress.kubernetes.io/cors-allow-origin": "*",
          },
          labels: { app: "tezos-node" },
        },
        spec: {
          rules: [
            {
              host: rpcDomain,
              http: {
                paths: [
                  {
                    path: "/",
                    pathType: "Prefix",
                    backend: {
                      service: {
                        name: "tezos-node-rpc",
                        port: {
                          name: "rpc",
                        },
                      },
                    },
                  },
                ],
              },
            },
          ],
          tls: [
            {
              hosts: [rpcDomain],
              secretName: `${rpcDomain}-secret`,
            },
          ],
        },
      },
      { provider, parent: this }
    )


    // Rollup
    if (
      this.tezosHelmValues.smartRollupNodes &&
      this.tezosHelmValues.smartRollupNodes.length != 0
    ) {
      let rollupFqdn = `evm-rollup-node.${name}.teztnets.xyz`
      let rollupIngressParams = {
        enabled: true,
        host: rollupFqdn,
        labels: {
          app: "rollup-evm",
        },
        annotations: {
          "kubernetes.io/ingress.class": "nginx",
          "cert-manager.io/cluster-issuer": "letsencrypt-prod",
          "nginx.ingress.kubernetes.io/enable-cors": "true",
          "nginx.ingress.kubernetes.io/cors-allow-origin": "*",
        },
        tls: [
          {
            hosts: [rollupFqdn],
            secretName: `${rollupFqdn}-secret`,
          },
        ],
      }
      this.tezosHelmValues.smartRollupNodes.evm.ingress = rollupIngressParams
      let evmProxyFqdn = `evm.${name}.teztnets.xyz`
      let evmProxyIngressParams = {
        enabled: true,
        host: evmProxyFqdn,
        labels: {
          app: "evm-proxy",
        },
        annotations: {
          "kubernetes.io/ingress.class": "nginx",
          "cert-manager.io/cluster-issuer": "letsencrypt-prod",
          "nginx.ingress.kubernetes.io/enable-cors": "true",
          "nginx.ingress.kubernetes.io/cors-allow-origin": "*",
        },
        tls: [
          {
            hosts: [evmProxyFqdn],
            secretName: `${evmProxyFqdn}-secret`,
          },
        ],
      }
      this.tezosHelmValues.smartRollupNodes.evm.evm_proxy.ingress =
        evmProxyIngressParams
    }

    // Data Availability Layer
    if (
      this.tezosHelmValues.dalNodes &&
      this.tezosHelmValues.dalNodes.length != 0) {
      const dalBootstrapRpcFqdn = `dal-bootstrap-rpc.${name}.teztnets.xyz`
      const dalBootstrapIngressParams = {
        enabled: true,
        host: dalBootstrapRpcFqdn,
        labels: {
          app: "dal-bootstrap",
        },
        annotations: {
          "kubernetes.io/ingress.class": "nginx",
          "cert-manager.io/cluster-issuer": "letsencrypt-prod",
          "nginx.ingress.kubernetes.io/enable-cors": "true",
          "nginx.ingress.kubernetes.io/cors-allow-origin": "*",
        },
        tls: [
          {
            hosts: [dalBootstrapRpcFqdn],
            secretName: `${dalBootstrapRpcFqdn}-secret`,
          },
        ],
      }
      this.tezosHelmValues.dalNodes.bootstrap.ingress = dalBootstrapIngressParams

      const dalBootstrapP2pFqdn = `dal.${name}.teztnets.xyz`
      const dalBootstrapSvcName = `${name}-dal-bootstrap`
      const dalBootstrapStaticIP = new gcp.compute.Address(`${name}-dal-bootstrap-ip`, {
        name: `${name}-dal-bootstrap-ip`,
        region: "us-central1", // Specify your GCP region here
      });
      new k8s.core.v1.Service(
        `${name}-dal-bootstrap-p2p-lb`,
        {
          metadata: {
            namespace: this.namespace.metadata.name,
            name: dalBootstrapSvcName,
            annotations: {
              "external-dns.alpha.kubernetes.io/hostname": dalBootstrapP2pFqdn,
              "service.beta.kubernetes.io/gcp-load-balancer-type": "External",
              "networking.gke.io/load-balancer-type": "External",

            },
          },
          spec: {
            ports: [
              {
                port: 11732,
                targetPort: 11732,
                protocol: "TCP",
              },
            ],
            selector: { app: "dal-bootstrap" },
            type: "LoadBalancer",
            loadBalancerIP: dalBootstrapStaticIP.address,
          },
        },
        { provider: provider }
      )

      const dalAttestorRpcFqdn = `dal-attestor-rpc.${name}.teztnets.xyz`
      const dalAttestorIngressParams = {
        enabled: true,
        host: dalAttestorRpcFqdn,
        labels: {
          app: "dal-dal1",
        },
        annotations: {
          "kubernetes.io/ingress.class": "nginx",
          "cert-manager.io/cluster-issuer": "letsencrypt-prod",
          "nginx.ingress.kubernetes.io/enable-cors": "true",
          "nginx.ingress.kubernetes.io/cors-allow-origin": "*",
        },
        tls: [
          {
            hosts: [dalAttestorRpcFqdn],
            secretName: `${dalAttestorRpcFqdn}-secret`,
          },
        ],
      }
      this.tezosHelmValues.dalNodes.dal1.ingress = dalAttestorIngressParams

      const dalAttestorP2pFqdn = `dal1.${name}.teztnets.xyz`
      const dal1SvcName = `${name}-dal-dal1`
      const dal1StaticIP = new gcp.compute.Address(`${name}-dal-dal1-ip`, {
        name: `${name}-dal-dal1-ip`,
        region: "us-central1", // Specify your GCP region here
      });

      new k8s.core.v1.Service(
        `${name}-dal-dal1-p2p-lb`,
        {
          metadata: {
            namespace: this.namespace.metadata.name,
            name: dal1SvcName,
            annotations: {
              "external-dns.alpha.kubernetes.io/hostname": dalAttestorP2pFqdn,
              "service.beta.kubernetes.io/gcp-load-balancer-type": "External",
              "networking.gke.io/load-balancer-type": "External",

            },
          },
          spec: {
            ports: [
              {
                port: 11732,
                targetPort: 11732,
                protocol: "TCP",
              },
            ],
            selector: { app: "dal-dal1" },
            type: "LoadBalancer",
            loadBalancerIP: dal1StaticIP.address,
          },
        },
        { provider: provider }
      )


      this.tezosHelmValues.dalNodes.bootstrap.publicAddr = pulumi.interpolate`${dalBootstrapStaticIP.address}:11732`
      this.tezosHelmValues.dalNodes.dal1.publicAddr = pulumi.interpolate`${dal1StaticIP.address}:11732`
      this.tezosHelmValues.dalNodes.dal1.peer = `${dalBootstrapP2pFqdn}:11732`
      this.tezosHelmValues.node_config_network.dal_config.bootstrap_peers = [
        `${dalBootstrapP2pFqdn}:11732`
      ]
    }

    let chartParams = getChartParams(params, "tezos");
    const chartValues: any = {
      ...chartParams,
      namespace: this.namespace.metadata.name,
      values: this.tezosHelmValues,
    }
    new k8s.helm.v3.Chart(
      name,
      chartValues,
      { providers: { kubernetes: provider } }
    )

    new k8s.core.v1.Service(
      `${name}-p2p-lb`,
      {
        metadata: {
          namespace: this.namespace.metadata.name,
          name: name,
          annotations: {
            "external-dns.alpha.kubernetes.io/hostname": `${name}.teztnets.xyz`,
          },
        },
        spec: {
          ports: [
            {
              port: 9732,
              targetPort: 9732,
              protocol: "TCP",
            },
          ],
          selector: { node_class: "tezos-baking-node" },
          type: "LoadBalancer",
        },
      },
      { provider: provider }
    )
  }

  getNetworkUrl(baseUrl?: string, relativeUrl?: string): string {
    if (
      "activation_account_name" in this.tezosHelmValues["node_config_network"]
    ) {
      baseUrl = baseUrl || "https://teztnets.xyz"
      relativeUrl = relativeUrl || this.name
      return `${baseUrl}/${relativeUrl}`
    }

    // network config hardcoded in binary, pass the name instead of URL
    return this.name
  }

  getDockerBuild(): string {
    return this.tezosHelmValues["images"]["octez"]
  }

  getGitRef(): pulumi.Output<string> {
    // guessing git version or release version based on docker naming convention
    // This will fail if octez changes repo tagging convention.
    let dockerBuild = pulumi.output(this.tezosHelmValues["images"]["octez"])
    return dockerBuild.apply((s: string) => {
      let o = s.split(":")[1]
      if (s.includes("master_")) {
        o = o.split("_")[1]
      }
      return o
    })
  }

  getRpcUrl(): string {
    return `https://rpc.${this.name}.teztnets.xyz`
  }
  getRollupUrls(): string[] {
    if (
      this.tezosHelmValues.smartRollupNodes &&
      this.tezosHelmValues.smartRollupNodes.length != 0
    ) {
      return [`https://evm-rollup-node.${this.name}.teztnets.xyz`]
    }
    return []
  }
  getEvmProxyUrls(): string[] {
    if (
      this.tezosHelmValues.smartRollupNodes &&
      this.tezosHelmValues.smartRollupNodes.length != 0
    ) {
      return [`https://evm.${this.name}.teztnets.xyz`]
    }
    return []
  }
  getDalRpcUrl(): string | undefined {
    if (
      this.tezosHelmValues.dalNodes &&
      this.tezosHelmValues.dalNodes.length != 0
    ) {
      return `https://dal-rpc.${this.name}.teztnets.xyz`
    }
    return
  }
  getDalP2pUrl(): string | undefined {
    if (
      this.tezosHelmValues.dalNodes &&
      this.tezosHelmValues.dalNodes.length != 0
    ) {
      return `dal.${this.name}.teztnets.xyz`
    }
    return
  }
  getRpcUrls(): Array<string> {
    return [...[this.getRpcUrl()], ...this.params.rpcUrls || []]
  }

  getLastBakingDaemon(): string {
    return this.tezosHelmValues["protocols"].slice(-1)[0]["command"]
  }
}
