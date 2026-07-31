import React from "react";
import Chart from "react-apexcharts";
import { ApexOptions } from "apexcharts";

const FlowChartCard = () => {
  // Generate data for 24 hours with a flow around 3.1 m³/hr
  const labels = Array.from({ length: 24 }, (_, i) => `${i.toString().padStart(2, '0')}:00`);
  const flowData = [
    3.0, 3.2, 3.1, 3.3, 3.0, 3.4, 3.2, 3.3, 3.1, 3.0, 3.2, 3.1,
    3.4, 3.5, 3.2, 3.3, 3.0, 3.1, 3.4, 3.2, 3.0, 3.1, 3.3, 3.0,
  ];

  const options: ApexOptions = {
    chart: {
      type: "area", // areaspline -> area with smooth curve
      background: "transparent", // Remove gray background
      height: 350,
      toolbar: { show: false },
    },
    legend: {
      show: false, // Turn off the legend
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
        text: "Flow (m³/hr)",
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
        return `<div style="padding:8px;background:#1F2937;border:1px solid #10B981;border-radius:4px;color:#fff;">${val} m³/hr</div>`;
      },
    },
    stroke: {
      curve: "smooth",
      width: 2, // Line thickness
    },
    fill: {
      opacity: 0.3, // Slight transparency for the filled area
    },
    colors: ["#10B981"], // Tailwind green-500
    markers: {
      size: 0, // Hide markers on data points for a cleaner look
    },
    dataLabels: { enabled: false },
  };

  const series = [
    {
      name: "Flow (m³/hr)",
      data: flowData,
    },
  ];

  return (
    <div className="w-full bg-white rounded-lg shadow-md p-6 font-sans">
      {/* Header */}
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold text-black">Flow</h3>
      </div>

      {/* Chart */}
      <Chart options={options} series={series} type="area" height={350} />
    </div>
  );
};

export default FlowChartCard;
