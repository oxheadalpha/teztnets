import * as pulumi from "@pulumi/pulumi";
import * as k8s from "@pulumi/kubernetes";
import * as awsx from "@pulumi/awsx";
import * as cronParser from "cron-parser";
import { TezosChain, TezosChainParameters } from "./TezosChain";
import { TezosImageResolver } from "./TezosImageResolver";

export class PeriodicChain extends TezosChain {
    constructor(name: string,
                params: TezosChainParameters,
                schedule: string,
                provider: k8s.Provider,
                repo: awsx.ecr.Repository,
                opts?: pulumi.ResourceOptions) {

        const deployDate = new Date(cronParser.parseExpression(schedule, {utc: true}).prev().toLocaleString());

        params.dnsName = name;
        params.chainName = params.chainName || `TEZOS-${name.toUpperCase()}-${deployDate.toISOString()}`;
        name = `${name.toLowerCase()}-${deployDate.toISOString().split('T')[0]}`;

        const imageResolver = new TezosImageResolver();
        params.containerImage = pulumi.output(imageResolver.getLatestTagAsync(deployDate))
                                .apply(tag => `${imageResolver.image}:${tag}`);

        super(name, params, provider, repo, opts);
    }

  getNetworkUrl(): string {
    return super.getNetworkUrl('https://teztnets.xyz', this.route53_name);
  }

}
