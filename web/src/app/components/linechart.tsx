import React from 'react';
import { Line } from 'react-chartjs-2';
import { Chart, CategoryScale, LinearScale, LineElement, PointElement, Title, Tooltip, Legend } from 'chart.js';
import resolveConfig from 'tailwindcss/resolveConfig';
import tailwindConfig from '../../../tailwind.config';

const fullConfig = resolveConfig(tailwindConfig);

Chart.register(CategoryScale, LinearScale, LineElement, PointElement, Title, Tooltip, Legend);

const textColor = fullConfig.theme.colors.gray[300];

const defaultColors = [
  fullConfig.theme.colors.blue[500],
  fullConfig.theme.colors.red[500],
  fullConfig.theme.colors.yellow[500],
  fullConfig.theme.colors.teal[500],
  fullConfig.theme.colors.purple[500],
  fullConfig.theme.colors.orange[500],
];

const createLineChartData = (datasets: { data: number[], label: string }[], labels: string[]) => {
  return {
    labels,
    datasets: datasets.map((dataset, index) => ({
      ...dataset,
      backgroundColor: defaultColors[index % defaultColors.length],
      borderColor: defaultColors[index % defaultColors.length],
      borderWidth: 2,
      fill: false,
    })),
  };
};

const LineChart = ({ 
  data, 
  labels,
  title,
  xTitle,
  yTitle
}: { 
  data: { data: number[], label: string }[]; 
  labels: string[];
  title: string;
  xTitle: string;
  yTitle: string;
}) => {
  const lineChartData = createLineChartData(data, labels);

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
          maxRotation: 45,
          minRotation: 45,
        },
        grid: {
          offset: false,
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
        beginAtZero: true,
      },
    },
  };

  return <Line data={lineChartData} options={options} />;
};

export default LineChart;
