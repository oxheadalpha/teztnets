import * as pulumi from "@pulumi/pulumi";
import * as k8s from "@pulumi/kubernetes";
import * as awsx from "@pulumi/awsx";
import { TezosChain, TezosChainParameters } from "./TezosChain";
import * as cronParser from "cron-parser";

export class PeriodicChain extends TezosChain {
    constructor(params: TezosChainParameters,
                schedule: string,
                valuesPath: string,
                k8sRepoPath: string,
                private_baking_key: string,
                private_non_baking_key: string,
                provider: k8s.Provider,
                repo: awsx.ecr.Repository,
                opts?: pulumi.ResourceOptions) {
            
            if (!params.simpleName) {
                throw new Error("simpleName not specified");
            }

            const alias = params.simpleName;

            const deployDate = new Date(
                cronParser.parseExpression(schedule, {utc: true}).prev().toLocaleString());
            
            // TODO: replace with lookup of the most recent image as of deployDate
            const containerImage = "tezos/tezos:master";

            params.chainName = params.chainName || `TEZOS-${alias.toUpperCase()}-${deployDate.toISOString()}`;;
            params.containerImage = params.containerImage || containerImage;
            params.dnsName = params.dnsName || alias;
            params.simpleName = `${alias.toLowerCase()}-${deployDate.toISOString().split('T')[0]}`;

            super(params, valuesPath, k8sRepoPath, private_baking_key, private_non_baking_key, provider, repo, opts);
        }
}
