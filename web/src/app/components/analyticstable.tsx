import React, { useEffect, useState } from 'react';
import { format } from 'date-fns';
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

type AnalyticsData = {
  query_timestamps: string[];
  retrieval_scores: number[];
  vector_search_latencies: number[];
  rag_generation_latencies: number[];
  error_rates?: {
    stackedBarChartData: {
      labels: string[];
      datasets: { label: string; data: number[] }[];
    };
  };
  error_distribution?: { pieChartData: { error_type: string; count: number }[] };
};

type ErrorRatesData = {
  labels: string[];
  datasets: { label: string; data: number[] }[];
};

type ErrorDistributionData = {
  error_type: string;
  count: number;
};

export function AnalyticsTable({ apiUrl }) {
  const [selectedAnalytic, setSelectedAnalytic] = useState('Search Performance');
  const [queryMetricsData, setQueryMetricsData] = useState<number[]>([]);
  const [queryMetricsLabels, setQueryMetricsLabels] = useState<string[]>([]);
  const [retrievalScoresData, setRetrievalScoresData] = useState<number[]>([]);
  const [vectorSearchLatencies, setVectorSearchLatencies] = useState<number[]>([]);
  const [ragGenerationLatencies, setRagGenerationLatencies] = useState<number[]>([]);
  const [throughputData, setThroughputData] = useState<number[]>([]);
  const [throughputLabels, setThroughputLabels] = useState<string[]>([]);
  const [errorRatesData, setErrorRatesData] = useState<ErrorRatesData>({ labels: [], datasets: [] });
  const [errorDistributionData, setErrorDistributionData] = useState<ErrorDistributionData[]>([]);
  const [hasData, setHasData] = useState({
    lineChart: false,
    barChart: false,
    stackedBarChart: false,
    pieChart: false,
    retrievalScores: false,
    latencyHistogram: false,
  });
  const [granularity, setGranularity] = useState('minute');
  const [originalData, setOriginalData] = useState<Partial<AnalyticsData>>({});

  useEffect(() => {
    const client = new R2RClient(apiUrl);
  
    const fetchData = async () => {
      try {
        const response = await client.getAnalytics();
        console.log('Full response:', response);
        const data: AnalyticsData = response.results;
        setOriginalData(data);
        processQueryMetricsData(data.query_timestamps, granularity);
        setHasData((prevState) => ({ ...prevState, lineChart: data.query_timestamps.length > 0 }));
        setRetrievalScoresData(data.retrieval_scores);
        setHasData((prevState) => ({ ...prevState, barChart: data.retrieval_scores.length > 0 }));
        if (data.vector_search_latencies) {
          setVectorSearchLatencies(data.vector_search_latencies);
          setHasData((prevState) => ({ ...prevState, barChart: data.vector_search_latencies.length > 0 }));
        }
        if (data.rag_generation_latencies) {
          setRagGenerationLatencies(data.rag_generation_latencies);
          setHasData((prevState) => ({ ... prevState, barChart: data.rag_generation_latencies.length > 0}));
        }
        if (data.error_rates) {
          setErrorRatesData(data.error_rates.stackedBarChartData);
          setHasData((prevState) => ({ ...prevState, stackedBarChart: data.error_rates.stackedBarChartData.labels.length > 0 }));
        }
        if (data.error_distribution) {
          setErrorDistributionData(data.error_distribution.pieChartData);
          setHasData((prevState) => ({ ...prevState, pieChart: data.error_distribution.pieChartData.length > 0 }));
        }
      } catch (error) {
        console.error('Error fetching analytics data:', error);
      }
    };
  
    fetchData();
  }, [apiUrl]);
  
  useEffect(() => {
    if (originalData.query_timestamps) {
      console.log('Original Data:', originalData);
      processQueryMetricsData(originalData.query_timestamps, granularity);
    }
  }, [granularity, originalData]);
  
  const processQueryMetricsData = (timestamps: string[], granularity: string) => {
    if (!timestamps) return;
  
    const formatDate = (date: Date, granularity: string) => {
      switch (granularity) {
        case 'minute':
          return format(date, 'yyyy-MM-dd HH:mm');
        case 'hour':
          return format(date, 'yyyy-MM-dd HH:00');
        case 'day':
          return format(date, 'yyyy-MM-dd');
        default:
          return format(date, 'yyyy-MM-dd HH:mm:ss');
      }
    };
  
    const aggregatedData: { [key: string]: number } = {};
    timestamps.forEach((timestamp) => {
      const date = new Date(timestamp);
      const label = formatDate(date, granularity);
      if (aggregatedData[label]) {
        aggregatedData[label]++;
      } else {
        aggregatedData[label] = 1;
      }
    });
  
    const uniqueLabels = [];
    const labelCounts = {};
    Object.keys(aggregatedData).forEach(label => {
      if (labelCounts[label]) {
        labelCounts[label]++;
        uniqueLabels.push(`${label} (${labelCounts[label]})`);
      } else {
        labelCounts[label] = 1;
        uniqueLabels.push(label);
      }
    });
  
    const data = uniqueLabels.map(label => aggregatedData[label]);
  
    setQueryMetricsLabels(uniqueLabels);
    setQueryMetricsData(data);
  };


  const renderCharts = () => {
    switch (selectedAnalytic) {
      case 'Query Metrics':
        return (
          <div className="w-full max-w-3xl mb-12">
            <LineChart
              data={queryMetricsData}
              labels={queryMetricsLabels}
              title="Queries Per Minute"
              xTitle="Time"
              yTitle="Number of Queries"
              hasData={hasData.lineChart}
              noDataMessage="No data available for Query Metrics."
              timeScale
              granularity={granularity}
            />
          </div>
        );
      case 'Search Performance':
        return (
          <div className="w-full max-w-3xl mb-12">
            <BarChart
              data={{ labels: [], datasets: [{ label: 'Retrieval Scores', data: retrievalScoresData }] }}
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
                noDataMessage="No data available for Throughput."
                timeScale
                granularity={granularity}
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
                noDataMessage="No data available for End-To-End Latency."
                timeScale
                granularity={granularity}
              />
            </div>
            <div className="mb-4">
              <BarChart
                data={{ labels: [], datasets: [{ label: 'Vector Search Latencies', data: vectorSearchLatencies }] }}
                title="Vector Search Latency Distribution"
                xTitle="Latency Range (seconds)"
                yTitle="Frequency"
                label="Latency Histogram"
                isHistogram={true}
                hasData={hasData.barChart}
                noDataMessage="No data available for Vector Search Latency."
              />
            </div>
            <div className="mb-4">
              <BarChart
                data={{ labels: [], datasets: [{ label: 'RAG Generation Latency', data: ragGenerationLatencies }] }}
                title="RAG Generation Latency Distribution"
                xTitle="Latency Range (seconds)"
                yTitle="Frequency"
                label="Latency Histogram"
                isHistogram={true}
                hasData={hasData.barChart}
                noDataMessage="No data available for LLM Response Latency."
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
                data={errorDistributionData.map(({ error_type, count }) => ({ label: error_type, count }))}
                title="Error Distribution"
                className="max-w-xs"
                hasData={hasData.pieChart}
                noDataMessage="No data available for Error Distribution."
              />
            </div>
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
        <div className="flex flex-col items-end">
          <select
            className="p-2 bg-zinc-700 text-white rounded mb-2"
            value={selectedAnalytic}
            onChange={(e) => setSelectedAnalytic(e.target.value)}
          >
            <option value="Search Performance">Search Performance</option>
            <option value="Query Metrics">Query Metrics</option>
            <option value="Throughput and Latency">Throughput and Latency</option>
            <option value="Errors">Errors</option>
          </select>
          <select
            className="p-2 bg-zinc-700 text-white rounded"
            value={granularity}
            onChange={(e) => setGranularity(e.target.value)}
          >
            <option value="minute">Minute</option>
            <option value="hour">Hour</option>
            <option value="day">Day</option>
          </select>
        </div>
      </div>
      <div className="mt-8 flex flex-col items-center">
        {renderCharts()}
      </div>
    </>
  );
}
