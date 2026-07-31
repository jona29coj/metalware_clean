import React from 'react';
import Chart from 'react-apexcharts';
import { ApexOptions } from 'apexcharts';

const LTODailyEnergyCycleChart = () => {
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
      data: [85, 90, 95, 100, 80, 85, 90], // Example data
    },
    {
      name: 'SoC',
      data: [70, 75, 80, 85, 65, 70, 75], // Example data
    },
  ];

  return <Chart options={options} series={series} type="area" height={350} />;
};

export default LTODailyEnergyCycleChart;
