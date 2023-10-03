import * as pulumi from "@pulumi/pulumi"
import * as k8s from "@pulumi/kubernetes"

const deployMonitoring = (
  provider: k8s.Provider,
  slackWebhook: pulumi.Output<string>
) => {
  const alertTitle =
    '[{{ .Status | toUpper }}{{ if eq .Status "firing" }}:{{ .Alerts.Firing | len }}{{ end }}] {{ .CommonLabels.alertname }} for {{ .CommonLabels.job }}'
  const alertText = `{{ range .Alerts -}}
  *Alert:* {{ .Annotations.title }}{{ if .Labels.severity }} - {{ .Labels.severity }}{{ end }}

  *Description:* {{ .Annotations.description }}

  *Details:*
    {{ range .Labels.SortedPairs }} • *{{ .Name }}:* {{ .Value }}
    {{ end }}
  {{ end }}
  `
  const alertmanagerConfig = {
    global: {
      slack_api_url: slackWebhook,
      resolve_timeout: "5m",
    },
    route: {
      group_by: ["alertname", "job", "service"],
      group_wait: "30s",
      group_interval: "5m",
      repeat_interval: "12h",
      receiver: "oxhead_slack",
      routes: [
        {
          match: {
            alertname: "Watchdog",
          },
          receiver: "null",
        },
        {
          match: {
            alertname: "CPUThrottlingHigh",
          },
          receiver: "null",
        },
      ],
    },
    receivers: [
      {
        name: "null",
      },
      {
        name: "oxhead_slack",
        slack_configs: [
          {
            channel: "#infra",
            send_resolved: true,
            icon_url: "https://avatars3.githubusercontent.com/u/3380462",
            title: alertTitle,
            text: alertText,
          },
        ],
      },
    ],
  }

  const monitorNamespace = new k8s.core.v1.Namespace(
    "monitoring",
    {
      metadata: { name: "monitoring" },
    },
    {
      provider: provider,
    }
  )

  new k8s.helm.v3.Release(
    "monitoring",
    {
      chart: "kube-prometheus-stack",
      repositoryOpts: {
        repo: "https://prometheus-community.github.io/helm-charts",
      },
      version: "48.3.1",
      namespace: monitorNamespace.metadata.name,
      values: {
        kubeApiServer: {
          enabled: false,
        },
        kubelet: {
          enabled: true,
        },
        kubeControllerManager: {
          enabled: false,
        },
        coreDns: {
          enabled: true,
        },
        kubeDns: {
          enabled: false,
        },
        kubeEtcd: {
          enabled: false,
        },
        kubeScheduler: {
          enabled: false,
        },
        kubeProxy: {
          enabled: false,
        },
        nodeExporter: {
          hostNetwork: false,
        },
        grafana: {
          adminPassword: "grafana",
        },
        alertmanager: {
          config: alertmanagerConfig,
        },
        prometheus: {
          prometheusSpec: {
            podMonitorNamespaceSelector: {
              any: true,
            },
            serviceMonitorNamespaceSelector: {
              any: true,
            },
          },
        },
      },
    },
    {
      provider: provider,
      dependsOn: [monitorNamespace],
      parent: monitorNamespace,
    }
  )
  new k8s.helm.v3.Chart(
    "tezos-prom",
    {
      chart: "tezos-prometheus-stack",
      path: "charts",
      namespace: monitorNamespace.metadata.name,
    },
    {
      provider: provider,
      dependsOn: [monitorNamespace],
      parent: monitorNamespace,
    }
  )
}

export default deployMonitoring
