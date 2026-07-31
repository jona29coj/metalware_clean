import React from 'react';
import Chart from 'react-apexcharts';
import { ApexOptions } from 'apexcharts';

const DailyEnergyCycleChart = () => {
  const options: ApexOptions = {
    chart: {
      type: 'area',
      background: 'transparent',
    },
    xaxis: {
      categories: ['Day 1', 'Day 2', 'Day 3', 'Day 4', 'Day 5', 'Day 6', 'Day 7'],
    },
    yaxis: {
      title: {
        text: 'State of Charge (%)',
      },
    },
    colors: ['#00c853', '#ff6f00'],
  };

  const series = [
    {
      name: 'Energy Cycle',
      data: [80, 75, 85, 90, 65, 70, 85], // Example data
    },
    {
      name: 'SoC',
      data: [50, 60, 55, 70, 50, 65, 75], // Example data
    },
  ];

  return <Chart options={options} series={series} type="area" height={350} />;
};

export default DailyEnergyCycleChart;
