import React from "react";
import Chart from "react-apexcharts";
import { ApexOptions } from "apexcharts";

const AirQualityCard = () => {
  const options: ApexOptions = {
    chart: {
      type: "line",
      background: "transparent",
      toolbar: { show: false },
    },
    xaxis: {
      categories: [
        "00:00",
        "01:00",
        "02:00",
        "03:00",
        "04:00",
        "05:00",
        "06:00",
        "07:00",
        "08:00",
        "09:00",
        "10:00",
        "11:00",
        "12:00",
        "13:00",
        "14:00",
        "15:00",
        "16:00",
        "17:00",
        "18:00",
        "19:00",
        "20:00",
        "21:00",
        "22:00",
        "23:00",
      ],
      title: {
        text: "Time (24 hours)",
      },
      axisBorder: { show: false }, // Removes x-axis line
    },
    yaxis: {
      title: {
        text: "Air Quality (ppm)",
      },
    },
    grid: {
      show: false, // Removes y-axis grid lines
    },
    tooltip: {
      shared: true,
      intersect: false,
      y: {
        formatter: (val: number) => `${val} ppm`,
      },
    },
    legend: {
      show: false, // Disables legend
    },
    colors: ["#00aaff"],
  };

  const series = [
    {
      name: "Air Quality",
      data: [50, 45, 40, 35, 60, 80, 120, 140, 130, 110, 90, 80, 60, 40, 35, 30, 50, 70, 90, 120, 100, 80, 60, 40],
    },
  ];

  return (
    <div className="bg-white p-6 rounded-lg shadow-md w-full">
      {/* Header */}
      <h2 className="text-lg text-black font-semibold mb-4">Air Quality</h2>

      {/* Chart */}
      <Chart options={options} series={series} type="line" height={350} />
    </div>
  );
};

export default AirQualityCard;
