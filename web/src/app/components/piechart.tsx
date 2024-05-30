import React from 'react';
import { Pie } from 'react-chartjs-2';
import { Chart, ArcElement, Tooltip, Legend } from 'chart.js';
import resolveConfig from 'tailwindcss/resolveConfig';
import tailwindConfig from '../../../tailwind.config';

const fullConfig = resolveConfig(tailwindConfig);

Chart.register(ArcElement, Tooltip, Legend);

const textColor = fullConfig.theme.colors.gray[300];

const defaultColors = [
  fullConfig.theme.colors.blue[500],
  fullConfig.theme.colors.red[500],
  fullConfig.theme.colors.yellow[500],
  fullConfig.theme.colors.teal[500],
  fullConfig.theme.colors.purple[500],
  fullConfig.theme.colors.orange[500],
];

const PieChart = ({
  data,
  title = 'Default Pie Chart',
  hasData = true,
  noDataMessage = 'No data available',
  className = '',
}: {
  data: { label: string; count: number }[];
  title?: string;
  hasData?: boolean;
  noDataMessage?: string;
  className?: string;
}) => {
  const pieChartData = {
    labels: data.map((entry) => entry.label),
    datasets: [
      {
        data: data.map((entry) => entry.count),
        backgroundColor: data.map((_, index) => defaultColors[index % defaultColors.length]),
        borderColor: data.map((_, index) => defaultColors[index % defaultColors.length]),
        borderWidth: 1,
      },
    ],
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
    },
  };

  return (
    <div className={`relative ${className}`}>
      <Pie data={pieChartData} options={options} />
      {!hasData && (
        <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 text-white">
          {noDataMessage}
        </div>
      )}
    </div>
  );
};

export default PieChart;
