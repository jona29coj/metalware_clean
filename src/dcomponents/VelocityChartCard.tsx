import React from "react";
import Chart from "react-apexcharts";
import { ApexOptions } from "apexcharts";

const VelocityChartCard = () => {
  // Generate data for 24 hours with fluctuating velocity between 0.2 m/s and 1.5 m/s
  const labels = Array.from({ length: 24 }, (_, i) => `${i.toString().padStart(2, '0')}:00`);
  const velocityData = [
    0.5, 0.8, 1.0, 1.2, 1.1, 0.9, 0.7, 0.6, 0.8, 1.3, 1.4, 1.0,
    0.6, 0.7, 1.2, 1.1, 0.9, 0.8, 1.0, 1.1, 1.4, 1.5, 0.7, 0.5,
  ];

  const options: ApexOptions = {
    chart: {
      type: "line", // Line chart type
      background: "transparent", // Remove gray background
      height: 350,
      toolbar: { show: false },
    },
    legend: {
      show: false, // Remove the legend
    },
    grid: {
      show: false, // Remove grid lines
    },
    xaxis: {
      categories: labels,
      title: {
        text: "Hour",
        style: {
          color: "#6B7280", // Tailwind gray-500
        },
      },
      labels: {
        style: {
          colors: "#6B7280", // Tailwind gray-500
        },
      },
    },
    yaxis: {
      title: {
        text: "Velocity (m/s)",
        style: {
          color: "#6B7280", // Tailwind gray-500
        },
      },
      min: 0, // Ensure the Y-axis starts from 0
      labels: {
        style: {
          colors: "#6B7280", // Tailwind gray-500
        },
      },
    },
    tooltip: {
      custom: ({ series, seriesIndex, dataPointIndex }: any) => {
        const val = series[seriesIndex][dataPointIndex];
        return `<div style="padding:8px;background:#1F2937;border:1px solid #00B5D8;border-radius:4px;color:#fff;">${val} m/s</div>`;
      },
    },
    stroke: {
      width: 2, // Line thickness
    },
    colors: ["red"], // Preserved verbatim from original (comment said "Teal color" but value was "red")
    markers: {
      size: 0, // Hide markers on data points for a cleaner look
    },
    dataLabels: { enabled: false },
  };

  const series = [
    {
      name: "Velocity (m/s)",
      data: velocityData,
    },
  ];

  return (
    <div className="w-full bg-white rounded-lg shadow-md p-6 font-sans">
      {/* Header */}
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold text-black">Velocity</h3>
      </div>

      {/* Chart */}
      <Chart options={options} series={series} type="line" height={350} />
    </div>
  );
};

export default VelocityChartCard;
