import React from 'react';
import { Line } from 'react-chartjs-2';
import { Chart, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, TimeScale } from 'chart.js';
import 'chartjs-adapter-date-fns';
import { enUS } from 'date-fns/locale';
import resolveConfig from 'tailwindcss/resolveConfig';
import tailwindConfig from '../../../tailwind.config';

const fullConfig = resolveConfig(tailwindConfig);

Chart.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, TimeScale);

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
  timeScale = false,
  granularity = 'minute',
}: {
  data: number[];
  labels: string[];
  title?: string;
  xTitle?: string;
  yTitle?: string;
  hasData?: boolean;
  noDataMessage?: string;
  timeScale?: boolean;
  granularity?: string;
}) => {

  const isEmpty = data.length === 0 || labels.length === 0;

  const lineChartData = {
    labels: isEmpty ? [] : labels.slice(-10),
    datasets: [
      {
        label: title,
        data: isEmpty ? [] : data.slice(-10),
        backgroundColor: defaultColors[0],
        borderColor: defaultColors[0],
        fill: false,
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
      tooltip: {
        callbacks: {
          label: (context) => {
            const value = context.raw;
            return `${context.dataset.label}: ${value}`;
          },
        },
      },
    },
    scales: {
      x: {
        type: timeScale ? 'time' : 'category',
        time: {
          unit: granularity,
          tooltipFormat: 'yyyy-MM-dd HH:mm',
          displayFormats: {
            minute: 'yyyy-MM-dd HH:mm',
            hour: 'yyyy-MM-dd HH:00',
            day: 'yyyy-MM-dd',
          },
        },
        title: {
          display: true,
          text: xTitle,
          color: textColor,
        },
        ticks: {
          color: textColor,
          autoSkip: true,
          maxTicksLimit: 10,
        },
        grid: {
          color: fullConfig.theme.colors.gray[800],
        },
        adapters: {
          date: {
            locale: enUS,
          },
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
      {!isEmpty ? (
        <Line data={lineChartData} options={options} />
      ) : (
        <div className="flex items-center justify-center bg-black bg-opacity-50 text-white h-64">
          {noDataMessage}
        </div>
      )}
    </div>
  );
};

export default LineChart;