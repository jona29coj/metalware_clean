import React from 'react';
import Chart from 'react-apexcharts';
import { ApexOptions } from 'apexcharts';

const IOEBatteryHourlyChart = () => {
  const options: ApexOptions = {
    chart: {
      type: 'bar',
      background: 'transparent',
    },
    xaxis: {
      categories: ['00:00', '01:00', '02:00', '03:00', '04:00', '05:00', '06:00', '07:00', '08:00', '09:00'],
      title: { text: 'Hour' },
    },
    yaxis: {
      title: { text: 'Energy (kWh)' },
    },
    colors: ['#f45b5b'],
  };

  const series = [
    {
      name: 'IOE Battery',
      data: [5, 8, 6, 7, 9, 10, 15, 18, 12, 9], // Sample data
    },
  ];

  return <Chart options={options} series={series} type="bar" height={350} />;
};

export default IOEBatteryHourlyChart;
