import * as pulumi from "@pulumi/pulumi";
import * as k8s from "@pulumi/kubernetes";
import * as awsx from "@pulumi/awsx";
import * as aws from "@pulumi/aws";
import * as cronParser from "cron-parser";
import { createCertValidation } from "./route53";
import { publicReadPolicyForBucket } from "./s3";
import { TezosImageResolver } from "./TezosImageResolver";
import * as docker from "@pulumi/docker";

import * as fs from 'fs';
import * as YAML from 'yaml';
const mime = require("mime");

export interface TezosHelmParameters {
  readonly helmValues: any;
  readonly faucetHelmValues: any;
}

export interface TezosInitParameters {
  getName(): string;
  getChainName(): string;
  getDescription(): string;
  getHumanName(): string;
  isPeriodic(): boolean;
  isMaskedFromMainPage(): boolean;
  getContainerImage(): string | pulumi.Output<string>;
  getDnsName(): string;
  getCategory(): string;
  getPeers(): string[];
  getContracts(): string[];
  getChartRepo(): string;
  getChartRepoVersion(): string;
  getChartPath(): string;
  getPrivateBakingKey(): string;
  getFaucetRecaptchaSiteKey(): pulumi.Output<string>;
  getFaucetRecaptchaSecretKey(): pulumi.Output<string>;
  getAliases(): string[];
  getIndexers(): { name: string, url: string }[];
  getRpcUrls(): string[];
}

export interface TezosParamsInitializer {
  readonly name?: string;
  readonly chainName?: string;
  readonly description?: string;
  readonly humanName?: string;
  readonly schedule?: string;
  readonly category?: string;
  readonly containerImage?: string | pulumi.Output<string>;
  readonly dnsName?: string;
  readonly bootstrapPeers?: string[];
  readonly bootstrapContracts?: string[];
  readonly chartRepo?: string;
  readonly chartRepoVersion?: string;
  readonly chartPath?: string;
  readonly privateBakingKey?: string;
  readonly faucetPrivateKey?: pulumi.Output<string>;
  readonly yamlFile?: string;
  readonly faucetYamlFile?: string;
  readonly maskedFromMainPage?: boolean;
  readonly faucetRecaptchaSiteKey?: pulumi.Output<string>;
  readonly faucetRecaptchaSecretKey?: pulumi.Output<string>;
  readonly aliases?: string[];
  readonly indexers?: { name: string, url: string }[];
  readonly rpcUrls?: string[];
}


export class TezosChainParametersBuilder implements TezosHelmParameters, TezosInitParameters {
  private _helmValues: any;
  private _faucetHelmValues: any;
  private _name: string;
  private _description: string;
  private _humanName: string;
  private _periodic: boolean;
  private _dnsName: string;
  private _category: string;
  private _publicBootstrapPeers: string[];
  private _bootstrapContracts: string[];
  private _chartRepo: string;
  private _chartRepoVersion: string;
  private _chartPath: string;
  private _maskedFromMainPage: boolean;
  private _faucetRecaptchaSiteKey: pulumi.Output<string>;
  private _faucetRecaptchaSecretKey: pulumi.Output<string>;
  private _aliases: string[];
  private _indexers: { name: string, url: string }[];
  private _rpcUrls: string[];


  constructor(params: TezosParamsInitializer = {}) {
    this._name = params.name || params.dnsName || '';
    this._description = params.description || '';
    this._humanName = params.humanName || '';
    this._dnsName = params.dnsName || params.name || '';
    this._category = params.category || '';
    this._publicBootstrapPeers = params.bootstrapPeers || [];
    this._bootstrapContracts = params.bootstrapContracts || [];
    this._chartRepo = params.chartRepo || '';
    this._chartRepoVersion = params.chartRepoVersion || '';
    this._chartPath = params.chartPath || '';
    this._periodic = false;
    this._maskedFromMainPage = params.maskedFromMainPage || false;
    this._faucetRecaptchaSiteKey = params.faucetRecaptchaSiteKey!;
    this._faucetRecaptchaSecretKey = params.faucetRecaptchaSecretKey!;
    this._aliases = params.aliases || [];
    this._indexers = params.indexers || [];
    this._rpcUrls = params.rpcUrls || [];

    this._helmValues = {};
    if (params.yamlFile) {
      this.fromFile(params.yamlFile);
    }
    this._faucetHelmValues = {};
    if (params.faucetYamlFile) {
      this.fromFaucetFile(params.faucetYamlFile);
    }
    if (params.schedule) {
      this.schedule(params.schedule);
    }
    if (params.chainName) {
      this.chainName(params.chainName);
    }
    if (params.containerImage) {
      this.containerImage(params.containerImage);
    }
    if (params.privateBakingKey) {
      this.privateBakingKey(params.privateBakingKey);
    }
    if (params.faucetPrivateKey) {
      this.faucetPrivateKey(params.faucetPrivateKey);
    }
  }

  public fromYaml(yaml: string): TezosChainParametersBuilder {
    this._helmValues = YAML.parse(yaml);
    return this;
  }

  public fromFile(yamlPath: string): TezosChainParametersBuilder {
    this.fromYaml(fs.readFileSync(yamlPath, 'utf8'));
    return this;
  }

  public fromFaucetYaml(yaml: string): TezosChainParametersBuilder {
    this._faucetHelmValues = YAML.parse(yaml);
    return this;
  }

  public fromFaucetFile(faucetYamlPath: string): TezosChainParametersBuilder {
    this.fromFaucetYaml(fs.readFileSync(faucetYamlPath, 'utf8'));
    return this;
  }

  public name(name: string): TezosChainParametersBuilder {
    this._name = name;
    this._dnsName = this._dnsName || name;
    return this;
  }
  public getName(): string {
    return this._name;
  }

  public chainName(chainName: string): TezosChainParametersBuilder {
    this._helmValues["node_config_network"]["chain_name"] = chainName;
    return this;
  }
  public timestamp(timestamp: string): TezosChainParametersBuilder {
    this._helmValues["node_config_network"]["genesis"]["timestamp"] = timestamp;
    return this;
  }
  public getChainName(): string {
    return this._helmValues["node_config_network"]["chain_name"];
  }

  public containerImage(containerImage: string | pulumi.Output<String>): TezosChainParametersBuilder {
    this._helmValues["images"]["octez"] = containerImage
    return this;
  }
  public getContainerImage(): string {
    return this._helmValues["images"]["octez"];
  }

  public dnsName(dnsName: string): TezosChainParametersBuilder {
    this._dnsName = dnsName;
    this._name = this._name || dnsName;
    return this;
  }
  public getDnsName(): string | any {
    return this._dnsName;
  }
  public getCategory(): string | any {
    return this._category;
  }

  public description(description: string): TezosChainParametersBuilder {
    this._description = description;
    return this;
  }
  public getDescription(): string | any {
    return this._description;
  }

  public getHumanName(): string | any {
    return this._humanName;
  }

  public isMaskedFromMainPage(): boolean {
    return this._maskedFromMainPage;
  }

  public isPeriodic(): boolean {
    return this._periodic;
  }

  public schedule(cronExpr: string): TezosChainParametersBuilder {
    const deployDate = new Date(cronParser.parseExpression(cronExpr, { utc: true }).prev().toLocaleString());
    const imageResolver = new TezosImageResolver();
    this.containerImage(pulumi.output(imageResolver.getLatestTagAsync(deployDate))
      .apply(tag => `${imageResolver.image}:${tag}`));
    this.name(`${this.getDnsName().toLowerCase()}-${deployDate.toISOString().split('T')[0]}`);
    if (deployDate.toISOString().split('T')[0] == "2022-10-24" && this.getDnsName().toLowerCase() == "mondaynet") {
      this.chainName(`TEZOS-MONDAY2NET-${deployDate.toISOString()}`);
    } else {
      this.chainName(`TEZOS-${this.getDnsName().toUpperCase()}-${deployDate.toISOString()}`);
    }
    this.timestamp(deployDate.toISOString());
    this._periodic = true;

    return this;
  }

  public peers(peers: string[]): TezosChainParametersBuilder {
    this._publicBootstrapPeers = peers;
    return this;
  }
  public peer(peer: string): TezosChainParametersBuilder {
    this._publicBootstrapPeers.push(peer);
    return this;
  }
  public getPeers(): string[] {
    return this._publicBootstrapPeers;
  }

  public contracts(contracts: string[]): TezosChainParametersBuilder {
    this._bootstrapContracts = contracts;
    return this;
  }
  public contract(contract: string): TezosChainParametersBuilder {
    this._bootstrapContracts.push(contract);
    return this;
  }
  public getContracts(): string[] {
    return this._bootstrapContracts;
  }

  public getFaucetRecaptchaSiteKey(): pulumi.Output<string> {
    return this._faucetRecaptchaSiteKey;
  }

  public getFaucetRecaptchaSecretKey(): pulumi.Output<string> {
    return this._faucetRecaptchaSecretKey;
  }

  public chartRepo(chartRepo: string): TezosChainParametersBuilder {
    this._chartRepo = chartRepo;
    return this;
  }
  public chartRepoVersion(chartRepoVersion: string): TezosChainParametersBuilder {
    this._chartRepoVersion = chartRepoVersion;
    return this;
  }
  public chartPath(chartPath: string): TezosChainParametersBuilder {
    this._chartPath = chartPath;
    return this;
  }
  public getChartRepo(): string {
    return this._chartRepo;
  }
  public getChartRepoVersion(): string {
    return this._chartRepoVersion;
  }
  public getChartPath(): string {
    return this._chartPath;
  }

  public privateBakingKey(privateBakingKey: string): TezosChainParametersBuilder {
    this._helmValues["accounts"]["oxheadbaker"]["key"] = privateBakingKey;
    return this;
  }
  public getPrivateBakingKey(): string {
    return this._helmValues["accounts"]["oxheadbaker"]["key"];
  }

  public faucetPrivateKey(faucetPrivateKey: pulumi.Output<string>): TezosChainParametersBuilder {
    this._faucetHelmValues["faucetPrivateKey"] = faucetPrivateKey;
    return this;
  }

  public get helmValues(): string {
    return this._helmValues;
  }
  public get faucetHelmValues(): string {
    return this._faucetHelmValues;
  }
  public getAliases(): string[] {
    return this._aliases;
  }
  public getIndexers(): { name: string, url: string }[] {
    return this._indexers;
  }
  public getRpcUrls(): string[] {
    return this._rpcUrls;
  }

}

/**
 * Deploy a tezos-k8s topology in a k8s cluster.
 * Supports either local charts or charts from a repo
 */

export class TezosChain extends pulumi.ComponentResource {
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
    opts?: pulumi.ResourceOptions) {

    const inputs: pulumi.Inputs = {
      options: opts,
    };

    const name = params.getName();
    super("pulumi-contrib:components:TezosChain", name, inputs, opts);

    this.params = params;
    this.provider = provider;
    this.repo = repo;
    this.zone = zone;

    var ns = new k8s.core.v1.Namespace(name,
      { metadata: { name: name, } },
      { provider: this.provider }
    );

    if (("activation" in params.helmValues) && params.getContracts()) {
      const activationBucket = new aws.s3.Bucket(`${name}-activation-bucket`);
      const activationBucketPublicAccessBlock = new aws.s3.BucketPublicAccessBlock(`${name}-activation-bucket-public-access-block`, {
        bucket: activationBucket.id,
        blockPublicAcls: false,
        blockPublicPolicy: false,
        ignorePublicAcls: false,
        restrictPublicBuckets: false,
      });
      const bucketPolicy = new aws.s3.BucketPolicy(`${name}-activation-bucket-policy`, {
        bucket: activationBucket.bucket,
        policy: activationBucket.bucket.apply(publicReadPolicyForBucket)
      });
      params.helmValues["activation"]["bootstrap_contract_urls"] = [];

      if (params.getContracts()) {
        params.getContracts().forEach(function(contractFile: any) {
          const bucketObject = new aws.s3.BucketObject(`${name}-${contractFile}`, {
            bucket: activationBucket.bucket,
            key: contractFile,
            source: new pulumi.asset.FileAsset(`bootstrap_contracts/${contractFile}`),
            contentType: mime.getType(contractFile),
          });
          params.helmValues["activation"]["bootstrap_contract_urls"].push(pulumi.interpolate`https://${activationBucket.bucketRegionalDomainName}/${contractFile}`);
        })
      }
    }

    const teztnetsDomain = `${name}.teztnets.xyz`

    const defaultResourceOptions: pulumi.ResourceOptions = { parent: this }
    const registry = repo.repository.registryId.apply(async id => {
      let credentials = await aws.ecr.getCredentials({
        registryId: id
      }, {
        ...defaultResourceOptions,
        async: true,
      });

      let decodedCredentials = Buffer.from(credentials.authorizationToken, "base64").toString();
      let [username, password] = decodedCredentials.split(":");
      if (!password || !username) {
        throw new Error("Invalid credentials");
      }

      return {
        registry: credentials.proxyEndpoint.replace("https://", ""),
        username: username,
        password: password,
      };
    })

    let _cacheFrom: docker.CacheFrom = {}
    let allNames: string[] = [...params.getAliases(), ...[name]];

    allNames.forEach(name => {
      if (Object.keys(params.helmValues).length != 0) {
        // RPC Ingress
        const rpcDomain = `rpc.${name}.teztnets.xyz`
        const rpcCert = new aws.acm.Certificate(
          `${rpcDomain}-cert`,
          {
            validationMethod: "DNS",
            domainName: rpcDomain,
          },
          { parent: this }
        )
        const { certValidation } = createCertValidation(
          {
            cert: rpcCert,
            targetDomain: rpcDomain,
            hostedZone: this.zone,
          },
          { parent: this }
        )

        const rpcIngName = `${rpcDomain}-ingress`
        const rpc_ingress = new k8s.networking.v1beta1.Ingress(
          rpcIngName,
          {
            metadata: {
              namespace: ns.metadata.name,
              name: rpcIngName,
              annotations: {
                "kubernetes.io/ingress.class": "alb",
                "alb.ingress.kubernetes.io/scheme": "internet-facing",
                "alb.ingress.kubernetes.io/healthcheck-path":
                  "/chains/main/chain_id",
                "alb.ingress.kubernetes.io/healthcheck-port": "8732",
                "alb.ingress.kubernetes.io/listen-ports":
                  '[{"HTTP": 80}, {"HTTPS":443}]',
                "ingress.kubernetes.io/force-ssl-redirect": "true",
                "alb.ingress.kubernetes.io/actions.ssl-redirect":
                  '{"Type": "redirect", "RedirectConfig": { "Protocol": "HTTPS", "Port": "443", "StatusCode": "HTTP_301"}}',
                // Prevent pulumi erroring if ingress doesn't resolve immediately
                "pulumi.com/skipAwait": "true",
              },
              labels: { app: "tezos-node" },
            },
            spec: {
              rules: [
                {
                  host: rpcDomain,
                  http: {
                    paths: [
                      {
                        path: "/*",
                        backend: {
                          serviceName: "ssl-redirect",
                          servicePort: "use-annotation",
                        },
                      },
                      {
                        path: "/*",
                        backend: {
                          serviceName: "tezos-node-rpc",
                          servicePort: "rpc",
                        },
                      },
                    ],
                  },
                },
              ],
            },
          },
          { provider, parent: this, dependsOn: certValidation }
        )
      }
    })

    let tezosK8sImages;
    let pulumiTaggedImages;
    if (params.getChartRepo() == '') {
      // assume tezos-k8s submodule present; build custom images, and deploy custom chart from path
      //make list of images to build in case we are using submodules
      const defaultHelmValuesFile = fs.readFileSync(`${params.getChartPath()}/charts/tezos/values.yaml`, 'utf8');
      const defaultHelmValues = YAML.parse(defaultHelmValuesFile);
      tezosK8sImages = defaultHelmValues["tezos_k8s_images"];
      // do not build zerotier for now since it takes times and it is not used in tqinfra
      delete tezosK8sImages["zerotier"];
    }

    if (Object.keys(params.faucetHelmValues).length != 0) {
      let chartParams;
      if (params.getChartPath()) {
        chartParams = { "path": `${params.getChartPath()}/charts/tezos-faucet` }
      } else {
        chartParams = {
          fetchOpts:
          {
            repo: params.getChartRepo(),
          },
          chart: 'tezos-faucet',
        }
      }

      let faucetChartValues: any = {
        namespace: ns.metadata.name,
        values: params.faucetHelmValues,
        version: params.getChartRepoVersion(),
      }
      faucetChartValues = { ...faucetChartValues, ...chartParams };
      const faucetDomain = `faucet.${teztnetsDomain}`
      faucetChartValues.values["googleCaptchaSecretKey"] = params.getFaucetRecaptchaSecretKey()
      faucetChartValues.values["authorizedHost"] = `https://${faucetDomain}`
      faucetChartValues.values["config"]["application"]["googleCaptchaSiteKey"] = params.getFaucetRecaptchaSiteKey()
      faucetChartValues.values["config"]["application"]["backendUrl"] = `https://${faucetDomain}`
      faucetChartValues.values["config"]["network"]["name"] = params.getHumanName()
      faucetChartValues.values["config"]["network"]["rpcUrl"] = `https://rpc.${teztnetsDomain}`
      faucetChartValues.values["ingress"]["host"] = `faucet.${teztnetsDomain}`
      new k8s.helm.v2.Chart(
        `${name}-faucet`,
        faucetChartValues,
        { providers: { kubernetes: this.provider } }
      )

      const faucetCert = new aws.acm.Certificate(
        `${faucetDomain}-cert`,
        {
          validationMethod: "DNS",
          domainName: faucetDomain,
        },
        { parent: this }
      )
      createCertValidation(
        {
          cert: faucetCert,
          targetDomain: faucetDomain,
          hostedZone: this.zone,
        },
        { parent: this }
      )

    }
    if (Object.keys(params.helmValues).length != 0) {
      if (params.getChartRepo() == '') {
        // assume tezos-k8s submodule present; build custom images, and deploy custom chart from path

        const chain = new k8s.helm.v2.Chart(
          name,
          {
            namespace: ns.metadata.name,
            path: `${params.getChartPath()}/charts/tezos`,
            values: params.helmValues,
          },
          { providers: { kubernetes: this.provider } }
        );
      } else {
        // deploy from helm repo with public images
        const chain = new k8s.helm.v2.Chart(
          name,
          {
            namespace: ns.metadata.name,
            chart: 'tezos-chain',
            version: params.getChartRepoVersion(),
            fetchOpts:
            {
              repo: params.getChartRepo(),
            },
            values: params.helmValues,
          },
          { providers: { kubernetes: this.provider } }
        );
      }


      allNames.forEach(name => {
        new k8s.core.v1.Service(
          `${name}-p2p-lb`,
          {
            metadata: {
              namespace: ns.metadata.name,
              name: name,
              annotations: {
                "service.beta.kubernetes.io/aws-load-balancer-type": "nlb-ip",
                "service.beta.kubernetes.io/aws-load-balancer-scheme": "internet-facing",
                "external-dns.alpha.kubernetes.io/hostname": `${name}.teztnets.xyz`,
              },
            },
            spec: {
              ports: [
                {
                  port: 9732,
                  targetPort: 9732,
                  protocol: "TCP",
                },
              ],
              selector: { node_class: "tezos-baking-node" },
              type: "LoadBalancer",
            },
          },
          { provider: this.provider }
        )
      })
    }
  }


  getChainName(): string {
    return this.params.getChainName();
  }

  getCategory(): string {
    return this.params.getCategory();
  }

  getDescription(): string {
    return this.params.getDescription();
  }

  getNetworkUrl(baseUrl?: string, relativeUrl?: string): string {
    if ("activation_account_name" in this.params.helmValues["node_config_network"]) {
      baseUrl = baseUrl || 'https://teztnets.xyz';
      relativeUrl = relativeUrl || this.params.getName();
      return `${baseUrl}/${relativeUrl}`;
    }

    // network config hardcoded in binary, pass the name instead of URL
    return this.params.getName();
  }

  getDockerBuild(): string {
    return this.params.helmValues["images"]["octez"];
  }

  getGitRef(): pulumi.Output<string> {
    // guessing git version or release version based on docker naming convention
    // This will fail if octez changes repo tagging convention.
    let dockerBuild = pulumi.output(this.params.helmValues["images"]["octez"]);
    return dockerBuild.apply((s: string) => {
      let o = s.split(":")[1];
      if (s.includes("master_")) {
        o = o.split("_")[1];
      }
      return o;
    });
  }

  getRpcUrl(): string {
    return `https://rpc.${this.params.getName()}.teztnets.xyz`;
  }
  getRpcUrls(): Array<string> {
    return [
      ...[this.getRpcUrl()],
      ...this.params.getRpcUrls(),
    ];
  }

  getLastBakingDaemon(): string {
    return this.params.helmValues["protocols"].slice(-1)[0]["command"];
  }


}