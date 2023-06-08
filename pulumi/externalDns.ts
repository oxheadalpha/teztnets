import * as aws from "@pulumi/aws"
import * as eks from "@pulumi/eks"
import * as k8s from "@pulumi/kubernetes"
import * as tezos from "@oxheadalpha/tezos-pulumi"

import { clusterOidcUrl, clusterOidcArn } from "../index"

const kubeSystem = "kube-system"

const deployExternalDns = ({ cluster }: any) => {
  const externalDnsRole = clusterOidcUrl?.apply(
    (url) =>
      new aws.iam.Role("external-dns-assume-role", {
        name: `external-dns-assume-role-${cluster.name}`,
        assumeRolePolicy: {
          Version: "2012-10-17",
          Statement: [
            {
              Effect: "Allow",
              Principal: {
                Federated: clusterOidcArn,
              },
              Action: "sts:AssumeRoleWithWebIdentity",
              Condition: {
                StringEquals: {
                  [`${url}: sub`]: `system: serviceaccount: ${kubeSystem}: external - dns`,
                },
              },
            },
          ],
        },
        tags: {
          clusterName: cluster.eksCluster.name,
        },
      })
  )

  const saName = `external-dns-${cluster.name}`;

  const externalDnsServiceAccount = new k8s.core.v1.ServiceAccount(
    `${saName}-sa`,
    {
      metadata: {
        name: saName,
        namespace: kubeSystem,
        annotations: {
          "eks.amazonaws.com/role-arn": externalDnsRole.arn,
        },
      },
    },
    { provider: cluster.provider, parent: cluster }
  )

  const externalDns = new tezos.aws.ExteranlDns(
    {
      iamRole: externalDnsRole,
      namespace: kubeSystem,
      txtOwnerId: cluster.eksCluster.name,
      zoneIdFilters: null,
      version: "6.13.0",
      values: {
        serviceAccount: {
          create: false,
          name: saName,
        }
      },
    },
    { provider: cluster.provider, parent: cluster }
  )
}

export default deployExternalDns
