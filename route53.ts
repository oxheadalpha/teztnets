import * as aws from "@pulumi/aws"
import * as pulumi from "@pulumi/pulumi"

// based on code from tqinfra
export function createCertValidation(
  {
    cert,
    targetDomain,
    hostedZone,
  }: { cert: aws.acm.Certificate; targetDomain: string; hostedZone: aws.route53.Zone },
  opts = {}
) {

  // certRecords won't show up in `pulumi preview` but will in `pulumi up`. This
  // is because certRecords is waiting for async data via the `apply` function.
  const certRecords = cert.domainValidationOptions.apply(
    (domainValidations) => {
      return domainValidations.map(
        (domainValidation) =>
          new aws.route53.Record(
            `${domainValidation.domainName}-certValidationRecord`,
            {
              name: domainValidation.resourceRecordName,
              records: [domainValidation.resourceRecordValue],
              ttl: 300,
              type: domainValidation.resourceRecordType,
              zoneId: hostedZone.id,
            },
            {
              ...opts,
            }
          )
      )
    }
  )

  const certValidation = new aws.acm.CertificateValidation(
    `${targetDomain}-certValidation`,
    {
      certificateArn: cert.arn,
      validationRecordFqdns: certRecords.apply((records) =>
        records.map((record) => record.fqdn)
      ),
    },
    {
      ...opts,
    }
  )
  return { certRecords, certValidation }
}
