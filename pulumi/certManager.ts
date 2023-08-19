import * as pulumi from "@pulumi/pulumi"
import * as aws from "@pulumi/aws"
import * as eks from "@pulumi/eks"
import * as k8s from "@pulumi/kubernetes"

import { clusterOidcUrl, clusterOidcArn } from "../index"

const certManagerNS = "cert-manager"

const deployCertManager = (cluster: eks.Cluster, awsAccountId: pulumi.Output<string>) => {
  const saName = "cert-manager"
  const roleName = "teztnets-cert-manager";
  const certManagerRole = clusterOidcUrl?.apply(
    (url) =>
      new aws.iam.Role("teztnets-cert-manager", {
        name: roleName,
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
                  [`${url}:sub`]: `system:serviceaccount:${certManagerNS}:${saName}`,
                },
              },
            },
            {
              // https://aws.amazon.com/blogs/security/announcing-an-update-to-iam-role-trust-policy-behavior/
              Effect: "Allow",
              Principal: {
                AWS: `arn:aws:iam::${awsAccountId}:role/${roleName}`
              },
              Action: "sts:AssumeRole",
            },
          ],
        },
        tags: {
          clusterName: cluster.eksCluster.name,
        },
      })
  )

  const certManagerNamespace = new k8s.core.v1.Namespace("cert-manager", {
    metadata: {
      name: certManagerNS,
    }
  }, {
    provider: cluster.provider,
  });
  new k8s.core.v1.ServiceAccount(
    `${saName}-sa`,
    {
      metadata: {
        name: saName,
        namespace: certManagerNamespace.metadata.name,
        annotations: {
          "eks.amazonaws.com/role-arn": certManagerRole.arn,
        },
      },
    },
    { provider: cluster.provider, parent: cluster }
  )
  const certManagerPolicy = new aws.iam.Policy(
    "cert-manager",
    {
      description:
        "Allows k8s cert-manager to manage R53 Hosted Zone records.",
      policy: {
        Version: "2012-10-17",
        Statement: [
          {
            Effect: "Allow",
            Action: "route53:GetChange",
            Resource: "arn:aws:route53:::change/*"
          },
          {
            Effect: "Allow",
            Action: [
              "route53:ChangeResourceRecordSets",
              "route53:ListResourceRecordSets"
            ],
            Resource: "arn:aws:route53:::hostedzone/*"
          },
          {
            Effect: "Allow",
            Action: "route53:ListHostedZonesByName",
            Resource: "*"
          }
        ]
      },
    },
  )

  new aws.iam.RolePolicyAttachment(
    "cert-manager",
    {
      policyArn: certManagerPolicy.arn,
      role: certManagerRole,
    },
  )
  new k8s.helm.v3.Release(
    "cert-manager",
    {
      chart: 'cert-manager',
      repositoryOpts: {
        repo: 'https://charts.jetstack.io',
      },
      version: "1.12.1",
      namespace: certManagerNamespace.metadata.name,
      values: {
        installCRDs: true,
        serviceAccount: {
          create: false,
          name: saName,
        },
        securityContext: {
          fsGroup: 1001
        }
      },
    },
    {
      provider: cluster.provider,
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
              dns01: {
                route53: {
                  region: aws.config.region,
                },
              },
            },
          ],
        },
      },
    },
    {
      provider: cluster.provider,
    }
  );
}

export default deployCertManager
