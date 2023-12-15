import * as fs from 'fs';
import * as path from 'path';
import * as k8s from '@pulumi/kubernetes';

export interface Parameters {
  readonly metricsPageFqdn: string;
}

const deployMetricsPage = async (provider: k8s.Provider, params: Parameters) => {
  // Directory containing Grafana dashboard JSON files
  const dashboardsDir = './grafana_dashboards';

  // Read all files from the directory
  const files = fs.readdirSync(dashboardsDir);
  let dashboardData: Record<string, string> = {};

  for (const file of files) {
    // Ensure it's a JSON file
    if (path.extname(file) === '.json') {
      const dashboardContent = fs.readFileSync(path.join(dashboardsDir, file), 'utf8');

      // Add the content to the dashboard data object
      dashboardData[file] = dashboardContent;
    }
  }

  // Create a single ConfigMap with all dashboard contents
  new k8s.core.v1.ConfigMap('octez-node-metrics', {
    metadata: {
      name: 'octez-node-metrics',
      namespace: 'monitoring',
      labels: {
        grafana_dashboard: '1',
        app: 'kube-prometheus-stack-grafana',
      },
    },
    data: dashboardData,
  }, { provider });
};

export default deployMetricsPage;
