import React from 'react';
import Chart from 'react-apexcharts';
import { ApexOptions } from 'apexcharts';

const LTOVoltageCurrentChart = () => {
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
        [2, 3],
        [3, 5],
        [4, 7],
        [5, 8],
        [6, 9],
        [7, 10],
        [8, 12],
        [9, 13],
      ], // Example data
    },
  ];

  return <Chart options={options} series={series} type="scatter" height={350} />;
};

export default LTOVoltageCurrentChart;
