import Chart from "react-apexcharts";
import { ApexOptions } from "apexcharts";
import 'tailwindcss/tailwind.css';

const EnergySources = () => {
  // Data for energy consumption (in kWh)
  const energyData: Record<string, number> = {
    "Grid": 300,    // kWh
    "Diesel": 150,  // kWh
  };

  const chartOptions: ApexOptions = {
    chart: {
      type: 'bar', // Horizontal bar chart
      toolbar: { show: false },
    },
    title: {
      text: undefined,
      style: { fontSize: "18px", color: "#333" },
    },
    xaxis: {
      categories: Object.keys(energyData),
      title: {
        text: undefined,
        style: { fontSize: "14px", color: "#666" },
      },
    },
    yaxis: {
      min: 0,
      title: {
        text: 'kWh',
        style: { fontSize: "14px", color: "#666" },
      },
      labels: {
        style: {
          fontSize: "12px", // Font size for the numbers on y-axis
        },
      },
    },
    grid: {
      xaxis: { lines: { show: false } },
      yaxis: { lines: { show: false } },
    },
    plotOptions: {
      bar: {
        horizontal: true,
      },
    },
    dataLabels: {
      enabled: true,
      style: {
        fontWeight: "bold",
        colors: ["black"],
      },
    },
    tooltip: {
      shared: true,
      intersect: false,
      y: {
        formatter: (val: number) => `${val} kWh`,
      },
    },
    legend: {
      show: false,
    },
  };

  const chartSeries = [
    {
      name: "Energy Consumption",
      data: [
        {
          x: "Grid",
          y: energyData["Grid"],
          fillColor: "rgba(54, 162, 235, 0.7)", // Blue with opacity
        },
        {
          x: "Diesel",
          y: energyData["Diesel"],
          fillColor: "rgba(153, 102, 255, 0.7)", // Purple with opacity
        },
      ],
    },
  ];

  return (
    <div className="w-full flex flex-col p-6 bg-white shadow-lg rounded-lg">
      <div className="flex justify-between items-center pb-6">
        <h2 className="text-xl font-semibold">Energy Sources</h2>
      </div>
      <div style={{ width: "100%", height: "400px" }}>
        <Chart options={chartOptions} series={chartSeries} type="bar" height={400} />
      </div>
    </div>
  );
};

export default EnergySources;
