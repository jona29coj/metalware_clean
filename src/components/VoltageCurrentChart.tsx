import React from 'react';
import Chart from 'react-apexcharts';
import { ApexOptions } from 'apexcharts';

const VoltageCurrentChart = () => {
  const options: ApexOptions = {
    chart: {
      type: 'scatter',
      zoom: { type: 'xy' },
      background: 'transparent',
    },
    xaxis: {
      title: {
        text: 'Voltage (V)',
      },
      tickPlacement: 'on',
    },
    yaxis: {
      title: {
        text: 'Current (A)',
      },
    },
    markers: {
      size: 5,
    },
  };

  const series = [
    {
      name: 'Voltage vs Current',
      data: [
        [1, 2],
        [2, 3],
        [3, 4],
        [4, 5],
        [5, 6],
        [6, 7],
        [7, 8],
        [8, 9],
        [9, 10],
      ], // Example data
    },
  ];

  return <Chart options={options} series={series} type="scatter" height={350} />;
};

export default VoltageCurrentChart;
