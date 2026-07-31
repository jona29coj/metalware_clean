import { useState } from "react";
import Chart from "react-apexcharts";
import { ApexOptions } from "apexcharts";

const EnergySources = () => {
  const [activeRange, setActiveRange] = useState("All");

  // Dummy data for 24 hours with 24-hour format
  const timeCategories: Record<string, string[]> = {
    All: [
      "00:00", "01:00", "02:00", "03:00", "04:00", "05:00", "06:00", "07:00", "08:00", "09:00", "10:00", "11:00",
      "12:00", "13:00", "14:00", "15:00", "16:00", "17:00", "18:00", "19:00", "20:00", "21:00", "22:00", "23:00"
    ]
  };

  const data: Record<string, { time: string; energy: number }[]> = {
    All: [
      { time: "00:00", energy: 10 }, { time: "01:00", energy: 15 }, { time: "02:00", energy: 12 },
      { time: "03:00", energy: 20 }, { time: "04:00", energy: 25 }, { time: "05:00", energy: 30 },
      { time: "06:00", energy: 35 }, { time: "07:00", energy: 40 }, { time: "08:00", energy: 38 },
      { time: "09:00", energy: 42 }, { time: "10:00", energy: 45 }, { time: "11:00", energy: 50 },
      { time: "12:00", energy: 55 }, { time: "13:00", energy: 60 }, { time: "14:00", energy: 65 },
      { time: "15:00", energy: 70 }, { time: "16:00", energy: 75 }, { time: "17:00", energy: 80 },
      { time: "18:00", energy: 85 }, { time: "19:00", energy: 90 }, { time: "20:00", energy: 95 },
      { time: "21:00", energy: 100 }, { time: "22:00", energy: 105 }, { time: "23:00", energy: 110 }
    ]
  };

  // ApexCharts configuration
  const options: ApexOptions = {
    chart: {
      type: "line",
      background: "transparent",
      height: "100%",
    },
    title: {
      text: "Energy Consumption",
    },
    xaxis: {
      categories: timeCategories[activeRange],
      title: {
        text: "Time",
      },
    },
    yaxis: {
      title: {
        text: "Energy (kWh)",
      },
    },
    colors: ["#1E90FF"],
    stroke: {
      width: 2,
    },
    tooltip: {
      y: {
        formatter: (val: number) => `${val} kWh`,
      },
    },
  };

  const series = [
    {
      name: "Energy",
      data: data[activeRange].map(item => item.energy), // Fixing this line
    },
  ];

  return (
    <div className="p-4 bg-white shadow rounded-lg max-w-full w-full">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-semibold">Energy Consumption</h2>
        <div className="flex gap-2">
          {["All"].map((label) => (
            <button
              key={label}
              className={`px-3 py-1 rounded ${activeRange === label ? "bg-blue-500 text-white" : "bg-gray-200"}`}
              onClick={() => setActiveRange(label)}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* ApexCharts Component */}
      <div className="w-full h-96 sm:h-80 md:h-72 lg:h-96">
        <Chart options={options} series={series} type="line" height="100%" />
      </div>
    </div>
  );
};

export default EnergySources;
