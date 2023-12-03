import * as k8s from "@pulumi/kubernetes"

const deployPyrometer = async ({
  provider,
  networks,
  teztnets,
}: {
  provider: k8s.Provider,
  networks: any,
  teztnets: any
}) => {
  const pyrometerDomain = "status.teztnets.xyz"

  const pyrometerStr = "pyrometer"
  const namespace = new k8s.core.v1.Namespace(
    pyrometerStr,
    { metadata: { name: pyrometerStr } },
    { provider: provider }
  )

  new k8s.helm.v3.Chart(
    pyrometerStr,
    {
      chart: pyrometerStr,
      version: "6.24.4",
      namespace: pyrometerStr,
      fetchOpts: {
        repo: "https://oxheadalpha.github.io/tezos-helm-charts/",
      },
      values: {
        config: {
          node_monitor: {
            nodes: Object.keys(networks)
              .filter((n) => n !== "ghostnet")
              .map((network) => ({
                url: `http://tezos-node-rpc.${network}:8732`,
                name: teztnets[network]['human_name']
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
          host: pyrometerDomain,
          tls: [
            {
              hosts: [pyrometerDomain],
              secretName: `${pyrometerDomain}-secret`,
            },
          ],
        },
      },
    },
    { providers: { kubernetes: provider }, parent: namespace }
  )
}

export default deployPyrometer
