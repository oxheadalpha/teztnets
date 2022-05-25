import * as pulumi from "@pulumi/pulumi";
import * as k8s from "@pulumi/kubernetes";
import * as awsx from "@pulumi/awsx";
import * as aws from "@pulumi/aws";
import * as tezos from "@oxheadalpha/tezos-pulumi"

import * as fs from 'fs';
import * as YAML from 'yaml';
const mime = require("mime");

export interface TezosHelmParameters {
  readonly helmValues: any;
}

export interface TezosInitParameters {
  getName(): string;
  getChainName(): string;
  getDescription(): string;
  getHumanName(): string;
}

export interface TezosParamsInitializer {
  readonly name ? : string;
  readonly chainName ? : string;
  readonly description ? : string;
  readonly humanName ? : string;
  readonly privateBakingKey ? : string;
}


export class TezosSignerParametersBuilder implements TezosHelmParameters, TezosInitParameters {
  private _helmValues: any;
  private _name: string;
  private _description: string;
  private _humanName: string;
  private _privateBakingKey: string;


  constructor(params: TezosParamsInitializer = {}) {
    this._name = params.name || '';
    this._description = params.description || '';
    this._humanName = params.humanName || '';
    this._privateBakingKey = params.privateBakingKey || '';

    this._helmValues = {};

    if (params.privateBakingKey) {
      this.privateBakingKey(params.privateBakingKey);
    }
  }

  public fromYaml(yaml: string): TezosSignerParametersBuilder {
    this._helmValues = YAML.parse(yaml);
    return this;
  }

  public fromFile(yamlPath: string): TezosSignerParametersBuilder {
    this.fromYaml(fs.readFileSync(yamlPath, 'utf8'));
    return this;
  }

  public getName(): string {
    return this._name;
  }

  public chainName(chainName: string): TezosSignerParametersBuilder {
    this._helmValues["node_config_network"]["chain_name"] = chainName;
    return this;
  }

  public getChainName(): string {
    return this._helmValues["node_config_network"]["chain_name"];
  }

  public description(description: string): TezosSignerParametersBuilder {
    this._description = description;
    return this;
  }
  public getDescription(): string | any {
    return this._description;
  }

  public getHumanName(): string | any {
    return this._humanName;
  }

  public privateBakingKey(privateBakingKey: string): TezosSignerParametersBuilder {
    this._privateBakingKey = privateBakingKey;
    return this;
  }
  public getPrivateBakingKey(): string {
    return this._privateBakingKey;
  }

  public get helmValues(): string {
    return this._helmValues;
  }

}

/**
 * Deploy a tezos-k8s topology in a k8s cluster.
 * Supports either local charts or charts from a repo
 */

export class TezosSigner extends pulumi.ComponentResource {
  readonly params: TezosHelmParameters & TezosInitParameters;
  readonly provider: k8s.Provider;
  readonly repo: awsx.ecr.Repository;
  readonly zone: aws.route53.Zone;

  // readonly ns: k8s.core.v1.Namespace;
  // readonly chain: k8s.helm.v2.Chart;

  /**
   * Deploys a private chain on a Kubernetes cluster.
   * @param name The name of the Pulumi resource.
   * @param params Helm chart values and chain bootstrap parameters
   * @param provider The Kubernetes cluster to deploy it into.
   * @param repo The container repository where to push the custom images for this chain.
   */
  constructor(params: TezosHelmParameters & TezosInitParameters,
    provider: k8s.Provider,
    repo: awsx.ecr.Repository,
    zone: aws.route53.Zone,
    opts ? : pulumi.ResourceOptions) {

    const inputs: pulumi.Inputs = {
      options: opts,
    };

    const name = params.getName();
    super("pulumi-contrib:components:TezosSigner", name, inputs, opts);

    this.params = params;
    this.provider = provider;
    this.repo = repo;
    this.zone = zone;

    var ns = new k8s.core.v1.Namespace(name, {
      metadata: {
        name: name,
      }
    }, {
      provider: this.provider
    });

    const signer = new tezos.TezosK8sHelmChart(
      `${name}-helm-chart`, {
        namespace: name,
        // The path to a Helm values.yaml file
        valuesFiles: `${name}/values.yaml`,
        // The latest tezos-k8s version as of the time of this writing.
        version: "6.6.1",
      }, {
        parent: this,
      }
    )
  }
}