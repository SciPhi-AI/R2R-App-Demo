import React from 'react';
import { Line } from 'react-chartjs-2';
import { Chart, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend } from 'chart.js';
import resolveConfig from 'tailwindcss/resolveConfig';
import tailwindConfig from '../../../tailwind.config';

const fullConfig = resolveConfig(tailwindConfig);

Chart.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

const textColor = fullConfig.theme.colors.gray[300];

const defaultColors = [
  fullConfig.theme.colors.blue[500],
  fullConfig.theme.colors.red[500],
  fullConfig.theme.colors.yellow[500],
  fullConfig.theme.colors.teal[500],
  fullConfig.theme.colors.purple[500],
  fullConfig.theme.colors.orange[500],
];

const LineChart = ({
  data,
  labels,
  title = 'Default Line Chart',
  xTitle = 'X Axis',
  yTitle = 'Y Axis',
  hasData = true,
  noDataMessage = 'No data available',
}: {
  data: { data: number[], label: string }[];
  labels: string[];
  title?: string;
  xTitle?: string;
  yTitle?: string;
  hasData?: boolean;
  noDataMessage?: string;
}) => {
  const lineChartData = {
    labels,
    datasets: data.map((dataset, index) => ({
      ...dataset,
      backgroundColor: defaultColors[index % defaultColors.length],
      borderColor: defaultColors[index % defaultColors.length],
      fill: false,
    })),
  };

  const options = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top',
        labels: {
          color: textColor,
        },
      },
      title: {
        display: true,
        text: title,
        color: textColor,
      },
      tooltip: {
        callbacks: {
          label: (context) => {
            const label = context.dataset.label || '';
            const value = context.raw;
            return `${label}: ${value}`;
          },
        },
      },
    },
    scales: {
      x: {
        title: {
          display: true,
          text: xTitle,
          color: textColor,
        },
        ticks: {
          color: textColor,
        },
        grid: {
          color: fullConfig.theme.colors.gray[800],
        },
      },
      y: {
        title: {
          display: true,
          text: yTitle,
          color: textColor,
        },
        ticks: {
          color: textColor,
        },
        grid: {
          color: fullConfig.theme.colors.gray[800],
        },
        beginAtZero: true,
      },
    },
  };

  return (
    <div className="relative">
      <Line data={lineChartData} options={options} />
      {!hasData && (
        <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 text-white">
          {noDataMessage}
        </div>
      )}
    </div>
  );
};

export default LineChart;
