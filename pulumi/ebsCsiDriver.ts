import * as aws from "@pulumi/aws"
import * as k8s from "@pulumi/kubernetes"
import * as pulumi from "@pulumi/pulumi"

const kubeSystem = "kube-system"

export const createEbsCsiRole = ({ clusterOidcUrl, clusterOidcArn }: any) => {
  const serviceAccountName = "ebs-csi-controller-sa"

  const csiRole = clusterOidcUrl?.apply(
    (url: string) =>
      new aws.iam.Role("ebs-csi", {
        name: "ebs-csi-role",
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
                  [`${url}:sub`]: `system:serviceaccount:${kubeSystem}:${serviceAccountName}`,
                  [`${url}:aud`]: "sts.amazonaws.com",
                },
              },
            },
          ],
        },
      })
  )

  new aws.iam.RolePolicyAttachment("ebs-csi-pa-1", {
    role: csiRole,
    policyArn: "arn:aws:iam::aws:policy/service-role/AmazonEBSCSIDriverPolicy",
  })

  const kmsKeyForEncryptionPolicy = new aws.iam.Policy(
    "ebs-csi-kms-encryption",
    {
      policy: {
        Version: "2012-10-17",
        Statement: [
          {
            Effect: "Allow",
            Action: ["kms:CreateGrant", "kms:ListGrants", "kms:RevokeGrant"],
            Resource: "*",
            Condition: {
              Bool: {
                "kms:GrantIsForAWSResource": "true",
              },
            },
          },
          {
            Effect: "Allow",
            Action: [
              "kms:Encrypt",
              "kms:Decrypt",
              "kms:ReEncrypt*",
              "kms:GenerateDataKey*",
              "kms:DescribeKey",
            ],
            Resource: "*",
          },
        ],
      },
    }
  )

  new aws.iam.RolePolicyAttachment("ebs-csi-pa-2", {
    role: csiRole,
    policyArn: kmsKeyForEncryptionPolicy.arn,
  })

  return csiRole
}

interface ChartArgs {
  version?: string
  values?: Record<string, any>
}
interface EbsSnapshotArgs {
  namespace?: string
  controllerChart?: ChartArgs
  webhookChart?: ChartArgs
}

export const deployEbsExternalSnapshotter = (
  { namespace = kubeSystem, controllerChart, webhookChart }: EbsSnapshotArgs,
  opts?: pulumi.CustomResourceOptions
) => {
  // Snapshotter functionality is dependent upon the gp3 storage class. The
  // storage class is not created by any of the the snapshot Helm charts so we
  // create it manually.
  const gp3StorageClass = new k8s.yaml.ConfigFile(
    "gp3-StorageClass",
    // Path is relative to root of Pulumi project
    { file: "../k8s-yaml/gp3StorageClass.yaml" },
    opts
  )

  // https://github.com/piraeusdatastore/helm-charts/tree/main/charts/snapshot-controller
  const snapshotControllerName = "ebs-csi-snapshot-controller"
  const snapshotControllerChart = new k8s.helm.v3.Release(
    snapshotControllerName,
    {
      name: snapshotControllerName,
      namespace,
      chart: "snapshot-controller",
      version: controllerChart?.version,
      repositoryOpts: {
        repo: "https://piraeus.io/helm-charts/",
      },
      values: {
        volumeSnapshotClasses: [
          {
            name: "ebs-csi-aws",
            driver: " ebs.csi.aws.com",
            deletionPolicy: "Delete",
            annotations: {
              "snapshot.storage.kubernetes.io/is-default-class": "true",
            },
          },
        ],
        ...controllerChart?.values,
      },
    },
    opts
  )

  // https://github.com/piraeusdatastore/helm-charts/tree/main/charts/snapshot-validation-webhook
  const webhookName = "ebs-csi-snapshot-validation-webhook"
  const snapshotValidationWebhookChart = new k8s.helm.v3.Release(
    webhookName,
    {
      name: webhookName,
      namespace,
      chart: "snapshot-validation-webhook",
      version: webhookChart?.version,
      repositoryOpts: {
        repo: "https://piraeus.io/helm-charts/",
      },
      values: webhookChart?.values,
    },
    opts
  )

  return { snapshotControllerChart, snapshotValidationWebhookChart }
}
