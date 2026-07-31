import React from 'react';
import Chart from 'react-apexcharts';
import { ApexOptions } from 'apexcharts';

const WaterConsumptionCard = () => {
  const options: ApexOptions = {
    chart: {
      type: 'area', // areaspline -> area with smooth curve
      toolbar: { show: false },
    },
    legend: {
      show: false, // Turn off the legend
    },
    grid: {
      show: false, // Remove grid lines
    },
    xaxis: {
      categories: Array.from({ length: 24 }, (_, i) => `${i.toString().padStart(2, '0')}:00`), // Generate "00:00" to "23:00"
      title: {
        text: 'Hour',
      },
    },
    yaxis: {
      title: {
        text: 'Water Consumption (m³)',
      },
      decimalsInFloat: 0, // Prevent decimals on the y-axis
    },
    tooltip: {
      shared: true,
      intersect: false,
      y: {
        formatter: (val: number) => `${val.toFixed(0)} m³`,
      },
    },
    stroke: {
      curve: 'smooth',
      width: 2,
    },
    fill: {
      opacity: 0.2, // Add transparency to the filled area
    },
    markers: {
      size: 0, // Hide individual data point markers
    },
    colors: ['#2563eb'], // Tailwind indigo-600
    dataLabels: { enabled: false },
  };

  const series = [
    {
      name: 'Water Consumption',
      data: [
        3, 4, 5, 6, 7, 8, 7, 6, 5, 4, 3, 4,
        5, 6, 7, 6, 5, 4, 3, 2, 3, 2, 1, 2,
      ], // Example data in whole cubic meters
    },
  ];

  return (
    <div className="bg-white shadow-md border border-gray-200 rounded-lg p-6 w-full">
      <div className="flex justify-between items-center mb-4">
        <div>
          <h2 className="text-lg font-semibold text-black">Water Consumption</h2>
        </div>
      </div>
      <Chart options={options} series={series} type="area" height={350} />
    </div>
  );
};

export default WaterConsumptionCard;
