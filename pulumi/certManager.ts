import * as pulumi from "@pulumi/pulumi"
import * as k8s from "@pulumi/kubernetes"

const certManagerNS = "cert-manager"

const deployCertManager = (provider: k8s.Provider) => {

  const certManagerNamespace = new k8s.core.v1.Namespace("cert-manager", {
    metadata: {
      name: certManagerNS,
    }
  }, {
    provider: provider,
  });

  new k8s.helm.v3.Release(
    "cert-manager",
    {
      chart: 'cert-manager',
      repositoryOpts: {
        repo: 'https://charts.jetstack.io',
      },
      version: "1.13.1",
      namespace: certManagerNamespace.metadata.name,
      values: {
        installCRDs: true,
        securityContext: {
          fsGroup: 1001
        }
      },
    },
    {
      provider: provider,
    }
  );
  new k8s.apiextensions.CustomResource(
    "cert-manager-prod-issuer",
    {
      apiVersion: 'cert-manager.io/v1',
      kind: 'ClusterIssuer',
      metadata: {
        name: 'letsencrypt-prod',
        namespace: certManagerNamespace.metadata.name,
      },
      spec: {
        acme: {
          server: 'https://acme-v02.api.letsencrypt.org/directory',
          email: 'nicolas.ochem@midl.dev',
          privateKeySecretRef: {
            name: 'letsencrypt-prod',
          },
          solvers: [
            {
              http01: {
                ingress: {
                  class: "nginx",
                },
              },
            },
          ],
        },
      },
    },
    {
      provider: provider,
    }
  );
}

export default deployCertManager
