// copied from tqinfra
import * as aws from "@pulumi/aws"
import * as eks from "@pulumi/eks"
import * as k8s from "@pulumi/kubernetes"

const deployExternalDns = (cluster: eks.Cluster) => {
  // Create a new IAM Policy for external-dns to manage R53 record sets.
  const externalDnsPolicy = new aws.iam.Policy("external-dns-iam-policy", {
    description: "Allows k8s external-dns to manage R53 Hosted Zone records.",
    policy: JSON.stringify({
      Version: "2012-10-17",
      Statement: [
        {
          Effect: "Allow",
          Action: ["route53:ChangeResourceRecordSets"],
          Resource: ["arn:aws:route53:::hostedzone/*"],
        },
        {
          Effect: "Allow",
          Action: ["route53:ListHostedZones", "route53:ListResourceRecordSets"],
          Resource: ["*"],
        },
      ],
    }),
  })

  new aws.iam.RolePolicyAttachment("external-dns-iam-role", {
    policyArn: externalDnsPolicy.arn,
    role: cluster.instanceRoles.apply((roles) => roles[0].name),
  })

  new k8s.helm.v2.Chart(
    "external-dns",
    {
      chart: "external-dns",
      version: "6.5.3",
      namespace: "default",
      fetchOpts: {
        repo: "https://charts.bitnami.com/bitnami",
      },
      // https://artifacthub.io/packages/helm/bitnami/external-dns#etcd-parameters
      values: {
        replicas: 2,
        // This tells extnernal-dns to only track records in the hosted zone
        // that were created for this cluster. Otherwise it will sync all records
        // in the hosted zone.
        txtOwnerId: cluster.eksCluster.name,
        // This will delete route53 records after an ingress or its hosts are
        // deleted.
        policy: "sync",
        aws: {
          zoneType: "public",
        },
      },
    },
    { providers: { kubernetes: cluster.provider } }
  )
}

export default deployExternalDns
