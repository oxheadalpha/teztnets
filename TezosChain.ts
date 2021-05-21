import * as pulumi from "@pulumi/pulumi";
import * as k8s from "@pulumi/kubernetes";
import * as awsx from "@pulumi/awsx";
import * as aws from "@pulumi/aws";
import { createAliasRecord } from "./route53";
import { publicReadPolicyForBucket } from "./s3";
import * as fs from 'fs';
import * as YAML from 'yaml';
const mime = require("mime");


interface TezosChainParameters {
  simpleName: string;
  chainName: string;
  containerImage: string;
  dnsName: string;
}

/**
 * Deploy a tezos-k8s topology in a k8s cluster.
 * Supports either local charts or charts from a repo
 */

export class TezosChain extends pulumi.ComponentResource {
  readonly name: string;
  readonly route53_name: string;
  readonly valuesPath: string;
  readonly ns: k8s.core.v1.Namespace;
  readonly chain: k8s.helm.v2.Chart;

  /**
  * Deploys a private chain on a cluster.
  * @param name The name of the private chain.
  * @param valuesPath The path to the values.yaml file for the helm chart
  * @param
  * @param cluster The kubernetes cluster to deploy it into.
  * @param repo The ECR repository where to push the custom images for this chain.
  */
  constructor(params: TezosChainParameters,
              valuesPath: string,
              teztnetMetadataPath: string,
              k8sRepoPath: string,
              private_baking_key: string,
              private_non_baking_key: string,
              provider: k8s.Provider,
              repo: awsx.ecr.Repository,
              opts?: pulumi.ResourceOptions) {

    const inputs: pulumi.Inputs = {
      options: opts,
    };

    const helmValuesFile = fs.readFileSync(valuesPath, 'utf8');
    const helmValues = YAML.parse(helmValuesFile);
    // if specified, params.chainName overrides node_config_network.chain_name from values.yaml
    helmValues["node_config_network"]["chain_name"] = params.chainName || helmValues["node_config_network"]["chain_name"];
    const name = params.simpleName || helmValues["node_config_network"]["chain_name"].split("T00")[0].toLowerCase().replace(/_/g, '-');

    super("pulumi-contrib:components:TezosChain", name, inputs, opts);

    // Default resource options for this component's child resources.
    const defaultResourceOptions: pulumi.ResourceOptions = { parent: this };

    this.name = name;
    this.route53_name = params.dnsName || name;
    this.valuesPath = valuesPath;
    this.ns = new k8s.core.v1.Namespace(this.name, { metadata: { name: this.name, } },
      { provider: provider });

    const defaultHelmValuesFile = fs.readFileSync(`${k8sRepoPath}/charts/tezos/values.yaml`, 'utf8');
    const defaultHelmValues = YAML.parse(defaultHelmValuesFile);

    const teztnetMetadataFile = fs.readFileSync(teztnetMetadataPath, 'utf8');
    const teztnetMetadata = YAML.parse(teztnetMetadataFile);
    if (("bootstrap_contracts" in teztnetMetadata) &&
      "activation" in helmValues &&
      (teztnetMetadata["bootstrap_contracts"].length > 0 || "bootstrap_commitments" in teztnetMetadata)) {
      const activationBucket = new aws.s3.Bucket("activation-bucket");
      const bucketPolicy = new aws.s3.BucketPolicy("activation-bucket-policy", {
        bucket: activationBucket.bucket,
        policy: activationBucket.bucket.apply(publicReadPolicyForBucket)
      });
      helmValues["activation"]["bootstrap_contract_urls"] = [];

      teztnetMetadata["bootstrap_contracts"].forEach(function (contractFile: any) {
        const bucketObject = new aws.s3.BucketObject(contractFile, {
          bucket: activationBucket.bucket,
          source: new pulumi.asset.FileAsset(`bootstrap_contracts/${contractFile}`),
          contentType: mime.getType(contractFile)
        });
        helmValues["activation"]["bootstrap_contract_urls"].push(pulumi.interpolate`https://${activationBucket.bucketRegionalDomainName}/${contractFile}`);
      });
      if ("bootstrap_commitments" in teztnetMetadata) {
        let commitmentFile = teztnetMetadata["bootstrap_commitments"];
        const bucketObject = new aws.s3.BucketObject(commitmentFile, {
          bucket: activationBucket.bucket,
          source: new pulumi.asset.FileAsset(`bootstrap_commitments/${commitmentFile}`),
          contentType: mime.getType(commitmentFile)
        });
        helmValues["activation"]["commitments_url"] = pulumi.interpolate`https://${activationBucket.bucketRegionalDomainName}/${commitmentFile}`;
      }
    }

    helmValues["accounts"]["tqbaker"]["key"] = private_baking_key;
    helmValues["accounts"]["tqfree"]["key"] = private_non_baking_key;

    const tezosK8sImages = defaultHelmValues["tezos_k8s_images"];
    // do not build zerotier for now since it takes times and it is not used in tqinfra
    delete tezosK8sImages["zerotier"];
    // if specified, parameter overrides container image from values.yaml
    tezosK8sImages["tezos"] = params.containerImage || tezosK8sImages["tezos"]

    const pulumiTaggedImages = Object.entries(tezosK8sImages).reduce(
      (obj: { [index: string]: any; }, [key]) => {
        obj[key] = repo.buildAndPushImage(`${k8sRepoPath}/${key.replace(/_/g, "-")}`);
        return obj;
      },
      {}
    );
    helmValues["tezos_k8s_images"] = pulumiTaggedImages;
    // deploy from repository
    //this.chain = new k8s.helm.v2.Chart(this.name, {
    //    namespace: this.ns.metadata.name,
    //    chart: 'tezos-chain',
    //    fetchOpts: { repo: k8sRepo },
    //    values: helmValues,
    //}, { providers: { "kubernetes": cluster.provider } });
    // Deploy Tezos into our cluster
    // Deploy from file
    this.chain = new k8s.helm.v2.Chart(this.name, {
      namespace: this.ns.metadata.name,
      path: `${k8sRepoPath}/charts/tezos`,
      values: helmValues,
    }, { providers: { "kubernetes": provider } });

    const p2p_lb_service = new k8s.core.v1.Service(
      `${this.name}-p2p-lb`,
      {
        metadata: {
          namespace: this.ns.metadata.name,
          name: this.name,
          annotations: {
            "service.beta.kubernetes.io/aws-load-balancer-type": "nlb-ip",
            "service.beta.kubernetes.io/aws-load-balancer-scheme": "internet-facing",
          },
        },
        spec: {
          ports: [{
            port: 9732,
            targetPort: 9732,
            protocol: "TCP"
          }],
          selector: { app: "tezos-baking-node" },
          type: "LoadBalancer"
        }
      },
      { provider: provider }
    );
    let aRecord = p2p_lb_service.status.apply((s) => createAliasRecord(`${this.route53_name}.tznode.net`, s.loadBalancer.ingress[0].hostname)
    );

  }

}
