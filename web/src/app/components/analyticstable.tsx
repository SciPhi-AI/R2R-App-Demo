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

const getColor = (index: number) => defaultColors[index % defaultColors.length];

export function AnalyticsTable({ apiUrl }: { apiUrl: string }) {
  const [selectedAnalytic, setSelectedAnalytic] = useState('Query Metrics');
  const [cosineSimilarityData, setCosineSimilarityData] = useState<number[]>([]);
  const [lineChartData, setLineChartData] = useState<{ data: number[], label: string }[]>([]);
  const [lineChartLabels, setLineChartLabels] = useState<string[]>([]);
  const [stackedBarChartData, setStackedBarChartData] = useState<any[]>([]);
  const [pieChartData, setPieChartData] = useState<{ label: string; count: number }[]>([]);

  useEffect(() => {
    const client = new R2RClient(apiUrl);
    // Using predefined bell curve data
    const fetchData = async () => {
      const histogramData = [
        0.0,
        0.15, 0.15,
        0.25, 0.25, 0.25,
        0.35, 0.35, 0.35, 0.35,
        0.45, 0.45, 0.45, 0.45, 0.45,
        0.55, 0.55, 0.55, 0.55, 0.55,
        0.65, 0.65, 0.65, 0.65,
        0.75, 0.75, 0.75,
        0.85, 0.85,
        0.95,
      ]; // Predefined bell curve points

      const lineData = [
        { label: 'Success Rate', data: Array.from({ length: 10 }, () => Math.random() * 100) },
        { label: 'Failure Rate', data: Array.from({ length: 10 }, () => Math.random() * 100) },
      ];
      const lineLabels = Array.from({ length: 10 }, (_, i) => `Point ${i + 1}`);

      const stackedData = [
        { label: 'Error Code 500', data: Array.from({ length: 10 }, () => Math.random() * 50) },
        { label: 'Error Code 404', data: Array.from({ length: 10 }, () => Math.random() * 50) },
        { label: 'Error Code 403', data: Array.from({ length: 10 }, () => Math.random() * 50) },
      ].map((dataset, index) => ({ ...dataset, backgroundColor: getColor(index) }));

      const pieData = [
        { label: 'Error Code 500', count: 50 },
        { label: 'Error Code 404', count: 30 },
        { label: 'Error Code 403', count: 20 },
      ];

      setCosineSimilarityData(histogramData);
      setLineChartData(lineData);
      setLineChartLabels(lineLabels);
      setStackedBarChartData(stackedData);
      setPieChartData(pieData);
    };
    fetchData();
  }, [apiUrl]);

  const renderCharts = () => {
    switch (selectedAnalytic) {
      case 'Query Metrics':
        return (
          <div className="w-full max-w-3xl mb-12">
            <LineChart 
              data={lineChartData} 
              labels={lineChartLabels} 
              title="Query Success Rate" 
              xTitle="Time" 
              yTitle="Success Rate (%)"
            />
            <BarChart
              data={cosineSimilarityData}
              title="Query Volume"
              xTitle="Time"
              yTitle='Volume'
              label="Query Volume"
              isHistogram={false}
            />
          </div>
        );
      case 'Search Performance':
        return (
          <div className="w-full max-w-3xl mb-12">
            <BarChart 
              data={cosineSimilarityData} 
              title="Cosine Similarity Distribution" 
              xTitle="Cosine Similarity Range" 
              yTitle="Frequency"
              label="Cosine Similarity Histogram"
              isHistogram={true}
            />
          </div>
        );
      case 'Throughput and Latency':
        return (
          <div className="w-full max-w-3xl mb-12">
            <LineChart 
              data={lineChartData} 
              labels={lineChartLabels} 
              title="Queries per minute" 
              xTitle="Time" 
              yTitle="Queries"
            />
            <LineChart 
              data={lineChartData} 
              labels={lineChartLabels} 
              title="End-To-End Latency" 
              xTitle="Time" 
              yTitle="Latency (ms)"
            />
            <LineChart 
              data={lineChartData} 
              labels={lineChartLabels} 
              title="Vector Search Latency" 
              xTitle="Time" 
              yTitle="Latency (ms)"
            />
            <LineChart 
              data={lineChartData} 
              labels={lineChartLabels} 
              title="LLM Response Latency" 
              xTitle="Time" 
              yTitle="Latency (ms)"
            />
          </div>
        );
      case 'Error Rates':
        return (
          <div className="w-full max-w-3xl mb-12">
            <BarChart 
              data={stackedBarChartData} 
              title="Server Failures" 
              xTitle="Time" 
              yTitle="Failures" 
              label="Stacked Bar Chart"
              isStacked={true}
            />
            <PieChart 
              data={pieChartData}
              title="Error Distribution"
              className="max-w-xs"  // Adjust the size of the pie chart
            />
          </div>
        );
      case 'Cost Metrics':
        return (
          <div className="w-full max-w-3xl mb-12">
            <LineChart 
              data={lineChartData} 
              labels={lineChartLabels} 
              title="LLM Generation Cost" 
              xTitle="Time" 
              yTitle="Cost ($)"
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
          <option value="Query Metrics">Query Metrics</option>
          <option value="Search Performance">Search Performance</option>
          <option value="Throughput and Latency">Throughput and Latency</option>
          <option value="Error Rates">Error Rates</option>
          <option value="Cost Metrics">Cost Metrics</option>
        </select>
      </div>
      <div className="mt-8 flex flex-col items-center">
        {renderCharts()}
      </div>
    </>
  );
}
