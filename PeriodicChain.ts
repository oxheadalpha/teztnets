import * as pulumi from "@pulumi/pulumi";
import * as k8s from "@pulumi/kubernetes";
import * as awsx from "@pulumi/awsx";
import { TezosChain } from "./TezosChain";
import * as cronParser from "cron-parser";

export class PeriodicChain extends TezosChain {
    constructor(alias: string,
                schedule: string,
                valuesPath: string,
                teztnetMetadataPath: string,
                k8sRepoPath: string,
                private_baking_key: string,
                private_non_baking_key: string,
                provider: k8s.Provider,
                repo: awsx.ecr.Repository,
                opts?: pulumi.ResourceOptions) {
            
            const deployDate = new Date(
                cronParser.parseExpression(schedule, {utc: true}).prev().toLocaleString());
            const chainName = `TEZOS-${alias.toUpperCase()}-${deployDate.toISOString()}`;
            
            // TODO: replace with lookup of the most recent image as of deployDate
            const containerImage = "tezos/tezos:master"; 

            super({
                chainName: chainName,
                containerImage: containerImage,
                dnsName: alias,
                simpleName: alias
            }, valuesPath, teztnetMetadataPath, k8sRepoPath, private_baking_key, private_non_baking_key, provider, repo, opts);
        }
}
