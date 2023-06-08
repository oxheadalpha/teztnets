import * as aws from "@pulumi/aws";
/**
 * Creates an IAM Role to be used for authentication to an EKS Cluster.
 *
 * Creates IAM Group and Trust Policies so that only members of the IAM Group
 *   will be allowed to authenticate to the cluster.
 *
 * IAM Users can be managed in the target group via the AWS Console.
 *
 * This role DOES NOT have resource policy attached to it and is only for cluster
 *   authentication.  A user assuming this role WILL NOT have any CLI or Console permissions
 *   on ANY AWS resources!
 *
 * This AWS IAM Role can be mapped to an K8s RBAC RoleBinding or ClusterRoleBinding via the cluster's roleMappings property.
 *
 * @param name Name of IAM Role and all Pulumi resources.
 * @param awsAccountId AWS Account ID used for Trust Policy of Role
 * @returns role Used in roleMappings of EKS Cluster. Used to provided authentication to cluster.
 */
export function createClusterAuthIamResources(name: string, awsAccountId: string, sensitive: boolean) {

  // This IAM group contains the users allowed to take on the IAM Role.
  // This group is managed manually by admins in the AWS console
  // This group has a policy attached that lets users assume the Role
  const group = new aws.iam.Group(name)
  const teztnetsRole = `arn:aws:iam::${awsAccountId}:role/teztnets-role`

  // Role with Trust Policy
  // Although any user in AWS account can potentially assume, users must be granted
  // assumeRole permission via the IAM Group assumeRole policy.
  // Only users in the IAM group are allowed to assume this role
  const role = new aws.iam.Role(name, {
    assumeRolePolicy: JSON.stringify({
      Version: "2012-10-17",
      Statement: [
        {
          Effect: "Allow",
          Principal: {
            AWS: [
              `arn:aws:iam::${awsAccountId}:root`,
              teztnetsRole,
            ],
          },
          Action: "sts:AssumeRole",
        },
      ],
    }),
  })

  // Policy that allows users in group to assume Role
  // Policy for EKS Cluster auth ONLY
  // NO AWS Permissions at all.
  const assumeRolePolicy = new aws.iam.Policy(name, {
    description: `Allows users in the ${name} group to assume the ${name} role.`,
    // The role arn is not available at runtime, so we've unwrapped the promise
    // and told it to wait until the role.arn is available.
    policy: role.arn.apply(roleArn => JSON.stringify({
      Version: "2012-10-17",
      Statement: [{
        Effect: "Allow",
        Action: "sts:AssumeRole",
        Resource: roleArn
      }]
    })),
  })

  // Attach assumeRole policy to Group
  // This policy ensures that only members of this group can assume the Role
  const assumeRolePolicyAttachment = new aws.iam.GroupPolicyAttachment(name, {
    group: group.name,
    policyArn: assumeRolePolicy.arn,
  })

  // Role to be used on roleMapping of EKS Cluster
  // This provides the authentication for the cluster

  const clusterAuthIamResourceObject = {
    role: role,
    group: group
  }
  return clusterAuthIamResourceObject
}

