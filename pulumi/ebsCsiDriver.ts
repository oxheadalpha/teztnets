import * as aws from "@pulumi/aws"

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
