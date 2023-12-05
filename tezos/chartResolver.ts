// chartParamsUtil.js

/**
 * Function to get chart parameters to pass to pulumi helm.
 * This allows to either use a local submodule chart or a released one.
 * Warning: When using a local one, if you require custom tezos-k8s images, make sure
 * to specify them in your params.
 * 
 * 
 * @param {any} params - The parameters to determine the chart parameters.
 * @param {string} chartName - The name of the chart.
 * @return {Object} The chart parameters.
 */
export function getChartParams(params: any, chartName: string): object {
  if (!params.chartPath && !params.chartRepoVersion) {
    throw new Error("Either 'chartPath' or 'chartRepoVersion' must be provided in params");
  }
  let chartParams: any;

  if (params.chartPath) {
    chartParams = { path: `${params.chartPath}/charts/${chartName}` };
  } else {
    let _chartName = chartName;
    if (chartName == "tezos") {
      // special case: the tezos chart is published as "tezos-chain"
      _chartName = "tezos-chain";

    }
    chartParams = {
      fetchOpts: {
        repo: "https://oxheadalpha.github.io/tezos-helm-charts"
      },
      chart: _chartName,
      version: params.chartRepoVersion
    };
  }

  return chartParams;
}
