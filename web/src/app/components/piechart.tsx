import React from 'react';
import { Pie } from 'react-chartjs-2';
import { Chart, ArcElement, Tooltip, Legend, Title } from 'chart.js';
import resolveConfig from 'tailwindcss/resolveConfig';
import tailwindConfig from '../../../tailwind.config';

const fullConfig = resolveConfig(tailwindConfig);
Chart.register(ArcElement, Tooltip, Legend, Title);

const textColor = fullConfig.theme.colors.gray[300];
const defaultColors = [
  fullConfig.theme.colors.blue[500],
  fullConfig.theme.colors.red[500],
  fullConfig.theme.colors.yellow[500],
  fullConfig.theme.colors.teal[500],
  fullConfig.theme.colors.purple[500],
  fullConfig.theme.colors.orange[500],
];

const createPieChartData = (data: { label: string; count: number }[]) => {
  return {
    labels: data.map(d => d.label),
    datasets: [
      {
        data: data.map(d => d.count),
        backgroundColor: data.map((_, index) => defaultColors[index % defaultColors.length]),
        borderColor: data.map((_, index) => defaultColors[index % defaultColors.length]),
        borderWidth: 1,
      },
    ],
  };
};

const PieChart = ({
  data,
  title,
  className,
}: {
  data: { label: string; count: number }[];
  title: string;
  className?: string;
}) => {
  const pieChartData = createPieChartData(data);
  const options = {
    responsive: true,
    plugins: {
      legend: {
        position: 'left',
        align: 'center',
        labels: {
          color: textColor,
          boxWidth: 12,
          padding: 20,
        },
      },
      title: {
        display: true,
        text: title,
        color: textColor,
        font: {
          size: 16,
        },
        padding: {
            top: 50,
        },
      },
      tooltip: {
        callbacks: {
          label: (context) => {
            const label = context.label || '';
            const value = context.raw;
            return `${label}: ${value}`;
          },
        },
      },
    },
  };

  return (
    <div className={className}>
      <Pie data={pieChartData} options={options} />
    </div>
  );
};

export default PieChart;
