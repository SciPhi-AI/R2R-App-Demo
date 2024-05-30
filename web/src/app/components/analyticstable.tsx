import React, { useEffect, useState } from 'react';
import BarChart from './barchart';
import LineChart from './linechart';
import PieChart from './piechart';
import { R2RClient } from '../../r2r-js-client';
import resolveConfig from 'tailwindcss/resolveConfig';
import tailwindConfig from '../../../tailwind.config';

const fullConfig = resolveConfig(tailwindConfig);

const defaultColors = [
  fullConfig.theme.colors.blue[500],
  fullConfig.theme.colors.red[500],
  fullConfig.theme.colors.yellow[500],
  fullConfig.theme.colors.teal[500],
  fullConfig.theme.colors.purple[500],
  fullConfig.theme.colors.orange[500],
];

const getColor = (index) => defaultColors[index % defaultColors.length];

export function AnalyticsTable({ apiUrl, timescale = 'day' }) {
  const [selectedAnalytic, setSelectedAnalytic] = useState('Search Performance');
  const [queryMetricsData, setQueryMetricsData] = useState([]);
  const [queryMetricsLabels, setQueryMetricsLabels] = useState([]);
  const [retrievalScoresData, setRetrievalScoresData] = useState([]);
  const [throughputData, setThroughputData] = useState([]);
  const [throughputLabels, setThroughputLabels] = useState([]);
  const [errorRatesData, setErrorRatesData] = useState({ labels: [], datasets: [] });
  const [errorDistributionData, setErrorDistributionData] = useState([]);
  const [costMetricsData, setCostMetricsData] = useState([]);
  const [costMetricsLabels, setCostMetricsLabels] = useState([]);
  const [hasData, setHasData] = useState({
    lineChart: false,
    barChart: false,
    stackedBarChart: false,
    pieChart: false,
    retrievalScores: false
  });

  useEffect(() => {
    const client = new R2RClient(apiUrl);

    const fetchData = async () => {
      try {
        const response = await client.getAnalytics();
        console.log("Full response:", response);
        const data = response.results;

        // Process Query Metrics data for the line chart
        const queryMetrics = data.query_metrics;
        if (queryMetrics) {
          setQueryMetricsData(queryMetrics.lineChartData.data);
          setQueryMetricsLabels(queryMetrics.lineChartData.labels);
          setHasData(prevState => ({ ...prevState, lineChart: queryMetrics.lineChartData.data.length > 0 }));
        }

        // Process Retrieval Scores data for the bar chart (as histogram)
        const retrievalScores = data.retrieval_scores;
        if (retrievalScores) {
          setRetrievalScoresData(retrievalScores);
          setHasData(prevState => ({ ...prevState, barChart: retrievalScores.length > 0 }));
        }

        // Process Throughput and Latency data for the line chart
        const throughputAndLatency = data.throughput_and_latency;
        if (throughputAndLatency) {
          setThroughputData(throughputAndLatency.lineChartData.data);
          setThroughputLabels(throughputAndLatency.lineChartData.labels);
          setHasData(prevState => ({ ...prevState, lineChart: throughputAndLatency.lineChartData.data.length > 0 }));
        }

        // Process Error data for the stacked bar chart
        const errorRates = data.error_rates?.stackedBarChartData;
        if (errorRates) {
          const { labels, datasets } = errorRates;
          setErrorRatesData({
            labels,
            datasets: datasets.map((dataset, index) => ({
              ...dataset,
              backgroundColor: getColor(index)
            }))
          });
          setHasData(prevState => ({
            ...prevState,
            stackedBarChart: labels.length > 0,
          }));
        }

        // Process Error Distribution data for the pie chart
        const errorDistribution = data.error_distribution?.pieChartData;
        if (errorDistribution) {
          setErrorDistributionData(errorDistribution);
          setHasData(prevState => ({
            ...prevState,
            pieChart: errorDistribution.length > 0,
          }));
        }

        // Process Cost Metrics data for the line chart
        const costMetrics = data.cost_metrics;
        if (costMetrics) {
          setCostMetricsData(costMetrics.lineChartData.data);
          setCostMetricsLabels(costMetrics.lineChartData.labels);
          setHasData(prevState => ({ ...prevState, lineChart: costMetrics.lineChartData.data.length > 0 }));
        }
      } catch (error) {
        console.error('Error fetching analytics data:', error);
      }
    };

    fetchData();
  }, [apiUrl, timescale]);

  const renderCharts = () => {
    switch (selectedAnalytic) {
      case 'Query Metrics':
        return (
          <div className="w-full max-w-3xl mb-12">
            <LineChart
              data={queryMetricsData}
              labels={queryMetricsLabels}
              title="Query Success Rate"
              xTitle="Time"
              yTitle="Success Rate (%)"
              hasData={hasData.lineChart}
              noDataMessage="No data available for Query Metrics."
            />
          </div>
        );
      case 'Search Performance':
        return (
          <div className="w-full max-w-3xl mb-12">
            <BarChart
              data={retrievalScoresData} // Pass the data array directly
              title="Cosine Similarity Distribution"
              xTitle="Cosine Similarity Range"
              yTitle="Frequency"
              label="Cosine Similarity Histogram"
              isHistogram={true}
              hasData={hasData.barChart}
              noDataMessage="No data available for Search Performance."
            />
          </div>
        );
      case 'Throughput and Latency':
        return (
          <div className="w-full max-w-3xl mb-12">
            <div className="mb-4">
              <LineChart
                data={throughputData}
                labels={throughputLabels}
                title="Requests per minute"
                xTitle="Time"
                yTitle="Queries"
                hasData={hasData.lineChart}
                noDataMessage="No data available for Throughput and Latency."
              />
            </div>
            <div className="mb-4">
              <LineChart
                data={throughputData}
                labels={throughputLabels}
                title="End-To-End Latency"
                xTitle="Time"
                yTitle="Latency (ms)"
                hasData={hasData.lineChart}
                noDataMessage="No data available for Throughput and Latency."
              />
            </div>
            <div className="mb-4">
              <LineChart
                data={throughputData}
                labels={throughputLabels}
                title="Vector Search Latency"
                xTitle="Time"
                yTitle="Latency (ms)"
                hasData={hasData.lineChart}
                noDataMessage="No data available for Throughput and Latency."
              />
            </div>
            <div className="mb-4">
              <LineChart
                data={throughputData}
                labels={throughputLabels}
                title="LLM Response Latency"
                xTitle="Time"
                yTitle="Latency (ms)"
                hasData={hasData.lineChart}
                noDataMessage="No data available for Throughput and Latency."
              />
            </div>
          </div>
        );
      case 'Errors':
        return (
          <div className="w-full max-w-3xl mb-12">
            <div className="mb-4">
              <BarChart
                data={errorRatesData}
                title="Server Failures"
                xTitle="Time"
                yTitle="Failures"
                label="Stacked Bar Chart"
                isStacked={true}
                hasData={hasData.stackedBarChart}
                noDataMessage="No data available for Server Failures."
              />
            </div>
            <div className="mb-4">
              <PieChart
                data={errorDistributionData}
                title="Error Distribution"
                className="max-w-xs"  // Adjust the size of the pie chart
                hasData={hasData.pieChart}
                noDataMessage="No data available for Error Distribution."
              />
            </div>
          </div>
        );
      case 'Cost Metrics':
        return (
          <div className="w-full max-w-3xl mb-12">
            <LineChart
              data={costMetricsData}
              labels={costMetricsLabels}
              title="LLM Generation Cost"
              xTitle="Time"
              yTitle="Cost ($)"
              hasData={hasData.lineChart}
              noDataMessage="No data available for Cost Metrics."
            />
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <>
      <div className="flex items-center justify-between pl-4 pr-4 pt-8">
        <h3 className="text-2xl font-bold text-blue-500">Analytics</h3>
        <select
          className="p-2 bg-zinc-700 text-white rounded"
          value={selectedAnalytic}
          onChange={(e) => setSelectedAnalytic(e.target.value)}
        >
          <option value="Search Performance">Search Performance</option>
          <option value="Query Metrics">Query Metrics</option>
          <option value="Throughput and Latency">Throughput and Latency</option>
          <option value="Errors">Errors</option>
          <option value="Cost Metrics">Cost Metrics</option>
        </select>
      </div>
      <div className="mt-8 flex flex-col items-center">
        {renderCharts()}
      </div>
    </>
  );
}
