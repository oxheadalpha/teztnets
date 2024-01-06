import * as k8s from "@pulumi/kubernetes"
import * as pulumi from "@pulumi/pulumi"
import { RandomPassword } from "@pulumi/random"
import * as fs from "fs"
import * as YAML from "yaml"
import { getChartParams } from './chartResolver'

export interface Parameters {
  readonly faucetPrivateKey: pulumi.Output<string>
  readonly faucetRecaptchaSiteKey: pulumi.Output<string>
  readonly faucetRecaptchaSecretKey: pulumi.Output<string>
  readonly humanName: string
  readonly namespace: k8s.core.v1.Namespace
  readonly helmValuesFile: string
  readonly chartPath?: string
  readonly chartRepoVersion?: string
}

/**
 * Deploy a tezos-k8s topology in a k8s cluster.
 * Supports either local charts or charts from a repo
 */

export class TezosFaucet extends pulumi.ComponentResource {
  readonly tezosFaucetHelmValues: any

  constructor(
    name: string,
    params: Parameters,
    provider: k8s.Provider,
    opts?: pulumi.ResourceOptions
  ) {
    const inputs: pulumi.Inputs = {
      options: opts,
    }
    super("pulumi-contrib:components:TezosFaucet", name, inputs, opts)

    this.tezosFaucetHelmValues = YAML.parse(
      fs.readFileSync(params.helmValuesFile, "utf8")
    );
    this.tezosFaucetHelmValues["faucetPrivateKey"] = params.faucetPrivateKey
    let chartParams = getChartParams(params, "tezos-faucet");

    if (this.tezosFaucetHelmValues.disableChallenges !== true) {
      if (!this.tezosFaucetHelmValues.redis) {
        this.tezosFaucetHelmValues.redis = {}
      }

      const redisPassword = new RandomPassword(
        `${name}-redis-pswd`,
        { length: 16 },
        { parent: this }
      ).result

      this.tezosFaucetHelmValues.redis.password = redisPassword

      new k8s.helm.v3.Release(
        `${name}-redis`,
        {
          chart: "redis",
          version: "17.15.6",
          namespace: params.namespace.metadata.name,
          repositoryOpts: {
            repo: "https://charts.bitnami.com/bitnami",
          },
          values: {
            // Keep the resource names short and simple
            fullnameOverride: "redis",
            // Deploy a single instance
            architecture: "standalone",
            // Don't create a pv and persist data
            master: {
              persistence: {
                enabled: false,
              },
            },
            global: {
              redis: {
                password: redisPassword,
              },
            },
          },
        },
        { provider: provider, parent: this }
      )
    }

    const teztnetsDomain = `${name}.teztnets.com`
    const faucetDomain = `faucet.${teztnetsDomain}`
    this.tezosFaucetHelmValues.googleCaptchaSecretKey =
      params.faucetRecaptchaSecretKey
    this.tezosFaucetHelmValues.authorizedHost = `https://${faucetDomain}`
    this.tezosFaucetHelmValues.config.application.googleCaptchaSiteKey =
      params.faucetRecaptchaSiteKey
    this.tezosFaucetHelmValues.config.application.backendUrl = `https://${faucetDomain}`
    this.tezosFaucetHelmValues.config.network.name =
      this.tezosFaucetHelmValues.config.network.name || params.humanName
    this.tezosFaucetHelmValues.config.network.rpcUrl = `https://rpc.${teztnetsDomain}`
    this.tezosFaucetHelmValues.ingress.host = faucetDomain
    this.tezosFaucetHelmValues.ingress.tls = [
      {
        hosts: [faucetDomain],
        secretName: `${faucetDomain}-secret`,
      },
    ]

    const faucetChartValues: any = {
      ...chartParams,
      namespace: params.namespace.metadata.name,
      values: this.tezosFaucetHelmValues,
      version: params.chartRepoVersion,
    }

    new k8s.helm.v3.Chart(`${name}-faucet`, faucetChartValues, {
      providers: { kubernetes: provider }, parent: this,
    })

  }
}
