import React from 'react';
import { Bar } from 'react-chartjs-2';
import { Chart, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';
import resolveConfig from 'tailwindcss/resolveConfig';
import tailwindConfig from '../../../tailwind.config';

const fullConfig = resolveConfig(tailwindConfig);

Chart.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const textColor = fullConfig.theme.colors.gray[300];

const defaultColors = [
  fullConfig.theme.colors.blue[500],
  fullConfig.theme.colors.red[500],
  fullConfig.theme.colors.yellow[500],
  fullConfig.theme.colors.teal[500],
  fullConfig.theme.colors.purple[500],
  fullConfig.theme.colors.orange[500],
];

const createHistogramData = (data: number[], binSize: number, label: string) => {
  const bins = Array.from({ length: Math.ceil(1 / binSize) + 1 }, (_, i) => i * binSize);
  const histogram = bins.map((bin, index) => {
    const nextBin = bins[index + 1] ?? 1;
    return data.filter(value => value >= bin && value < nextBin).length;
  });
  return {
    labels: bins.slice(0, -1).map((bin, index) => {
      const nextBin = bins[index + 1];
      return `${bin.toFixed(1)} - ${nextBin.toFixed(1)}`;
    }),
    datasets: [
      {
        label,
        backgroundColor: defaultColors[0],
        borderColor: defaultColors[0],
        borderWidth: 1,
        data: histogram.slice(0, -1), // Ensure the data array is the same length as the labels
        barPercentage: 1.0,
        categoryPercentage: 1.0,
      },
    ],
  };
};

const BarChart = ({
  data,
  title = 'Default Bar Chart',
  xTitle = 'X Axis',
  yTitle = 'Y Axis',
  label = 'Default Bar Chart',
  barPercentage = 0.9,
  categoryPercentage = 0.8,
  isHistogram = false,
  isStacked = false,
}: {
  data: any[];
  title?: string;
  xTitle?: string;
  yTitle?: string;
  label?: string;
  barPercentage?: number;
  categoryPercentage?: number;
  isHistogram?: boolean;
  isStacked?: boolean;
}) => {
  const barChartData = isHistogram
    ? createHistogramData(data, 0.1, label)
    : {
        labels: Array.isArray(data) && typeof data[0] === 'number'
          ? data.map((_, index: number) => `Label ${index + 1}`)
          : data.length > 0 && data[0]?.data ? data[0].data.map((_: any, index: number) => `Label ${index + 1}`) : [],
        datasets: Array.isArray(data) && typeof data[0] === 'number'
          ? [
              {
                label,
                backgroundColor: defaultColors[0],
                borderColor: defaultColors[0],
                borderWidth: 1,
                data,
                barPercentage,
                categoryPercentage,
              },
            ]
          : data.map((dataset, index) => ({
              ...dataset,
              backgroundColor: defaultColors[index % defaultColors.length],
              borderColor: defaultColors[index % defaultColors.length],
              barPercentage,
              categoryPercentage,
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
            const range = context.label;
            return `${label}: ${value} (Range: ${range})`;
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
          offset: isHistogram ? false : true,
        },
        stacked: isStacked,
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
        stacked: isStacked,
      },
    },
  };

  return <Bar data={barChartData} options={options} />;
};

export default BarChart;
