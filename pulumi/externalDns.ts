import * as k8s from "@pulumi/kubernetes"

const deployExternalDns = (provider: k8s.Provider) => {
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
      // https://artifacthub.io/packages/helm/bitnami/external-dns#etcd-parameters
      values: {
        replicas: 2,
        // This tells extnernal-dns to only track records in the hosted zone
        // that were created for this cluster. Otherwise it will sync all records
        // in the hosted zone.
        //txtOwnerId: cluster.eksCluster.name,
        // This will delete route53 records after an ingress or its hosts are
        // deleted.
        policy: "sync",
        aws: {
          zoneType: "public",
        },
      },
    },
    { provider: provider }
  )
}

export default deployExternalDns
