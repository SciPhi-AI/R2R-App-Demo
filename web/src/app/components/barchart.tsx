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

const createHistogramData = (data, label) => {
  if (!Array.isArray(data)) {
    console.error('Data passed to createHistogramData is not an array:', data);
    return {
      labels: [],
      datasets: []
    };
  }

  const max = Math.max(...data);
  const binCount = max > 1 ? 10 : 10; // Always 10 bins
  const binSize = max > 1 ? max / binCount : 0.1;

  const bins = Array.from({ length: binCount }, (_, i) => i * binSize);
  const histogram = bins.map((bin, index) => {
    const nextBin = bins[index + 1] ?? max + binSize;
    if (index === bins.length - 1) {
      return data.filter(value => value >= bin && value <= max).length;
    }
    return data.filter(value => value >= bin && value < nextBin).length;
  });

  return {
    labels: bins.map((bin, index) => {
      const nextBin = bins[index + 1] ?? max;
      return `${bin.toFixed(1)} - ${nextBin.toFixed(1)}`;
    }),
    datasets: [
      {
        label,
        backgroundColor: defaultColors[0],
        borderColor: defaultColors[0],
        borderWidth: 1,
        data: histogram,
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
  hasData = true,
  noDataMessage = 'No data available',
}) => {
  // Validate data structure
  const validData = data && Array.isArray(data.datasets) && data.datasets.length > 0 && Array.isArray(data.datasets[0].data);

  const barChartData = isHistogram
    ? createHistogramData(data.datasets[0].data, 0.1, label)
    : {
        ...data,
        datasets: data.datasets ? data.datasets.map((dataset, index) => ({
          ...dataset,
          backgroundColor: defaultColors[index % defaultColors.length],
          borderColor: defaultColors[index % defaultColors.length],
        })) : [],
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

  return (
    <div className="relative">
      <Bar data={barChartData} options={options} />
      {!hasData && (
        <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 text-white">
          {noDataMessage}
        </div>
      )}
    </div>
  );
};

BarChart.createHistogramData = createHistogramData;

export default BarChart;
