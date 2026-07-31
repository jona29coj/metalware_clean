import React from 'react';
import Chart from 'react-apexcharts';
import { ApexOptions } from 'apexcharts';

const UPSBatteryHourlyChart = () => {
  const options: ApexOptions = {
    chart: {
      type: 'line',
      background: 'transparent',
    },
    xaxis: {
      categories: ['00:00', '01:00', '02:00', '03:00', '04:00', '05:00', '06:00', '07:00', '08:00', '09:00', '10:00', '11:00'],
    },
    yaxis: {
      title: {
        text: 'kWh',
      },
    },
  };

  const series = [
    {
      name: 'UPS Battery',
      data: [10, 20, 15, 18, 25, 30, 45, 35, 40, 50, 55, 60], // Example data
    },
  ];

  return <Chart options={options} series={series} type="line" height={350} />;
};

export default UPSBatteryHourlyChart;
