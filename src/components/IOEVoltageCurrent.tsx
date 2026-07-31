import React from 'react';
import Chart from 'react-apexcharts';
import { ApexOptions } from 'apexcharts';

const IOEVoltageCurrentChart = () => {
  const options: ApexOptions = {
    chart: {
      type: 'scatter',
      background: 'transparent',
    },
    xaxis: {
      title: { text: 'Voltage (V)' },
    },
    yaxis: {
      title: { text: 'Current (A)' },
    },
    colors: ['#90ed7d'],
  };

  const series = [
    {
      name: 'IOE Battery',
      data: [[220, 50], [230, 55], [240, 60], [250, 65], [260, 70]], // Sample data
    },
  ];

  return <Chart options={options} series={series} type="scatter" height={350} />;
};

export default IOEVoltageCurrentChart;
