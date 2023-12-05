import * as k8s from "@pulumi/kubernetes"
import { getChartParams } from './chartResolver'

export interface Parameters {
  readonly networks: any;
  readonly teztnets: any;
  readonly statusPageFqdn: string;
  readonly chartPath?: string
  readonly chartRepoVersion?: string
}

const deployStatusPage = async (
  provider: k8s.Provider,
  params: Parameters,
) => {

  const namespace = new k8s.core.v1.Namespace(
    "status-page",
    { metadata: { name: "status-page" } },
    { provider: provider }
  )
  const helmValues = {
    config: {
      node_monitor: {
        nodes: Object.keys(params.networks)
          .filter((n) => n !== "ghostnet")
          .map((network) => ({
            url: `http://tezos-node-rpc.${network}:8732`,
            name: params.teztnets[network]['human_name']
          }))
      },
      ui: {
        enabled: true,
        host: "0.0.0.0",
        port: 8080,
      },
      log: {
        level: "info",
        timestamp: false,
      },
    },
    ingress: {
      enabled: true,
      annotations: {
        "kubernetes.io/ingress.class": "nginx",
        "cert-manager.io/cluster-issuer": "letsencrypt-prod",
        "nginx.ingress.kubernetes.io/enable-cors": "true",
        "nginx.ingress.kubernetes.io/cors-allow-origin": "*",
      },
      host: params.statusPageFqdn,
      tls: [
        {
          hosts: [params.statusPageFqdn],
          secretName: `${params.statusPageFqdn}-secret`,
        },
      ],
    },
  }
  let chartParams = getChartParams(params, 'pyrometer')
  const chartValues: any = {
    ...chartParams,
    namespace: namespace.metadata.name,
    values: helmValues,
  }

  new k8s.helm.v3.Chart(
    "status-page",
    chartValues,
    { providers: { kubernetes: provider }, parent: namespace }
  )
}

export default deployStatusPage
