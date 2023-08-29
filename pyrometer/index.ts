import * as aws from "@pulumi/aws"
import { Cluster } from "@pulumi/eks"
import * as k8s from "@pulumi/kubernetes"

import { createCertValidation } from "../route53"

const deployPyrometer = async ({
  cluster,
  networks,
  teztnetsHostedZone,
}: {
  cluster: Cluster
  networks: any
  teztnetsHostedZone: aws.route53.Zone
}) => {
  const pyrometerDomain = "status.teztnets.xyz"

  const pyrometerCert = new aws.acm.Certificate(`${pyrometerDomain}-cert`, {
    validationMethod: "DNS",
    domainName: pyrometerDomain,
  })

  createCertValidation({
    cert: pyrometerCert,
    targetDomain: pyrometerDomain,
    hostedZone: teztnetsHostedZone,
  })

  const pyrometerStr = "pyrometer"
  const namespace = new k8s.core.v1.Namespace(
    pyrometerStr,
    { metadata: { name: pyrometerStr } },
    { provider: cluster.provider, parent: cluster }
  )

  new k8s.helm.v3.Chart(
    pyrometerStr,
    {
      chart: pyrometerStr,
      version: "6.22.0",
      namespace: pyrometerStr,
      fetchOpts: {
        repo: "https://oxheadalpha.github.io/tezos-helm-charts/",
      },
      values: {
        config: {
          node_monitor: {
            nodes: Object.keys(networks)
              .filter((n) => n !== "ghostnet")
              .map((network) => `http://tezos-node-rpc.${network}:8732`),
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
    { providers: { kubernetes: cluster.provider }, parent: namespace }
  )
}

export default deployPyrometer
