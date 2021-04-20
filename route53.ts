import * as pulumi from "@pulumi/pulumi";
import * as eks from "@pulumi/eks";
import * as k8s from "@pulumi/kubernetes";
import * as awsx from "@pulumi/awsx";
import * as aws from "@pulumi/aws";

import * as fs from 'fs';
import * as YAML from 'yaml'

function getDomainAndSubdomain(domain: string) {
  const parts = domain.split('.');
  if (parts.length < 2) {
    throw new Error(`No TLD found on ${domain}`);
  }
  // No subdomain, e.g. awesome-website.com.
  if (parts.length === 2) {
    return { fullurl: domain, subdomain: '', parentDomain: domain };
  }

  const subdomain = parts[0];
  parts.shift(); // Drop first element.
  return {
    fullurl: domain,
    subdomain,
    // Trailing "." to canonicalize domain.
    parentDomain: parts.join('.') + '.'
  };
}

export function createAliasRecord(targetDomain: string, albUrl: string): aws.route53.Record {
  const targetDomainObj = getDomainAndSubdomain(targetDomain);

  const albUrlObj = getDomainAndSubdomain(albUrl);
  console.log('albUrlObj', albUrlObj);
  const hostedZoneIdALB = aws.elb.getHostedZoneId().then(hostedZoneIdALB => hostedZoneIdALB.id);

   const targetZoneID = aws.route53.getZone({
    name: "tznode.net",
    }).then(targetZoneID => targetZoneID.zoneId)

  return new aws.route53.Record(targetDomain, {
    name: targetDomainObj.subdomain,
    zoneId: targetZoneID,
    type: 'A',
    aliases: [
      {
        name: albUrlObj.fullurl,
        zoneId: hostedZoneIdALB,
        evaluateTargetHealth: false
      }
    ]
  });
}
