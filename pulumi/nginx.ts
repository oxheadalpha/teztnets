import * as k8s from "@pulumi/kubernetes"

const deployNginx = ({ provider }: any) => {
  const nginxNamespace = new k8s.core.v1.Namespace("nginx", {
    metadata: {
      name: "nginx",
    }
  }, {
    provider: provider,
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
      provider: provider,
    }
  )
}

export default deployNginx
