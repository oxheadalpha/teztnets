import * as aws from "@pulumi/aws"
import * as k8s from "@pulumi/kubernetes"
import * as tezos from "@oxheadalpha/tezos-pulumi"

const deployNginx = ({ cluster }: any) => {
  const nginxNamespace = new k8s.core.v1.Namespace("nginx", {
    metadata: {
      name: "nginx",
    }
  }, {
    provider: cluster.provider,
  });
  new k8s.helm.v3.Release(
    "nginx",
    {
      chart: 'ingress-nginx',
      repositoryOpts: {
        repo: 'https://kubernetes.github.io/ingress-nginx',
      },
      version: "4.4.2",
      values: {
        controller: {
          publishService: {
            enabled: 'true',
          },
        },
      },
      namespace: nginxNamespace.metadata.name,
      timeout: 450,
    },
    {
      provider: cluster.provider,
    }
  )
}

export default deployNginx
