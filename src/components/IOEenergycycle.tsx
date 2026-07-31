import React from 'react';
import Chart from 'react-apexcharts';
import { ApexOptions } from 'apexcharts';

const IOEEnergyCycleChart = () => {
  const options: ApexOptions = {
    chart: {
      type: 'line',
      background: 'transparent',
    },
    xaxis: {
      categories: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
      title: { text: 'Day' },
    },
    yaxis: {
      title: { text: 'State of Charge (%)' },
    },
    colors: ['#7cb5ec', '#f7a35c'],
  };

  const series = [
    {
      name: 'Energy Cycle',
      data: [90, 85, 80, 75, 78, 88, 92], // Sample data
    },
    {
      name: 'SoC',
      data: [95, 90, 85, 80, 85, 90, 95], // Sample data
    },
  ];

  return <Chart options={options} series={series} type="line" height={350} />;
};

export default IOEEnergyCycleChart;
