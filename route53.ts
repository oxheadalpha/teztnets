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
  // FIXME: You can't get the hosted zone of the NLB from k8s API.
  // See issue: https://github.com/pulumi/pulumi-aws/issues/1353
  // It works fine for ALBs though.
  // I am hardcoding zone here for teztnets
  // The solution seems to be to use kubernetes external-dns to have k8s control creation of route53 records instead of having pulumi do it
  // https://github.com/kubernetes-sigs/external-dns
  const hostedZoneIdALB = "ZLMOA37VPKANP";

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
