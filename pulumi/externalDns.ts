import * as pulumi from "@pulumi/pulumi"
import * as k8s from "@pulumi/kubernetes"


const deployExternalDns = (provider: k8s.Provider, doToken: pulumi.Output<string>) => {
  // Create a new IAM Policy for external-dns to manage R53 record sets.
  new k8s.helm.v3.Release(
    "external-dns",
    {
      chart: "external-dns",
      version: "6.26.2",
      namespace: "default",
      repositoryOpts: {
        repo: "https://charts.bitnami.com/bitnami",
      },
      // https://www.digitalocean.com/community/tutorials/how-to-automatically-manage-dns-records-from-digitalocean-kubernetes-using-externaldns
      values: {
        provider: "digitalocean",

        digitalocean: {
          apiToken: doToken,
        },
        interval: "1m",
        policy: "sync",
        domainFilters: [
          "teztnets.xyz"
        ]

      },
    },
    { provider: provider }
  )
}

export default deployExternalDns
