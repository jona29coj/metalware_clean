import Chart from 'react-apexcharts';
import { ApexOptions } from 'apexcharts';

const BuildingOverview = () => {
  // Data for Grid Consumption chart
  const gridConsumptionOptions: ApexOptions = {
    title: {
      text: 'Grid Consumption (kWh)',
    },
    chart: {
      type: 'bar',
    },
    xaxis: {
      categories: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct'],
      title: {
        text: 'Months',
      },
    },
    yaxis: {
      min: 0,
      title: {
        text: 'Energy (kWh)',
      },
    },
    colors: ['#4B5563'], // Dark gray
    tooltip: {
      y: {
        formatter: (val: number) => `${val} kWh`,
      },
    },
    plotOptions: {
      bar: {
        columnWidth: '80%',
      },
    },
  };

  const gridConsumptionSeries = [
    {
      name: 'Grid Consumption',
      data: [500, 450, 600, 550, 700, 680, 750, 800, 850, 780],
    },
  ];

  // Data for Wheeled-in Energy chart
  const wheeledInEnergyOptions: ApexOptions = {
    title: {
      text: 'Wheeled-in Energy (kWh)',
    },
    chart: {
      type: 'line',
    },
    xaxis: {
      categories: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct'],
      title: {
        text: 'Months',
      },
    },
    yaxis: {
      min: 0,
      title: {
        text: 'Energy (kWh)',
      },
    },
    colors: ['#10B981'], // Green
    tooltip: {
      y: {
        formatter: (val: number) => `${val} kWh`,
      },
    },
    dataLabels: {
      enabled: true,
    },
  };

  const wheeledInEnergySeries = [
    {
      name: 'Wheeled-in Energy',
      data: [350, 320, 410, 360, 420, 430, 460, 500, 540, 520],
    },
  ];

  // Data for Grid Energy Maximum (kWh) chart
  const gridEnergyMaxOptions: ApexOptions = {
    title: {
      text: 'Grid Energy Maximum (kWh)',
    },
    chart: {
      type: 'area',
    },
    xaxis: {
      categories: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct'],
      title: {
        text: 'Months',
      },
    },
    yaxis: {
      min: 0,
      title: {
        text: 'Energy (kWh)',
      },
    },
    colors: ['#1D4ED8'], // Blue
    tooltip: {
      y: {
        formatter: (val: number) => `${val} kWh`,
      },
    },
    fill: {
      opacity: 0.5,
    },
  };

  const gridEnergyMaxSeries = [
    {
      name: 'Grid Energy Maximum',
      data: [600, 580, 640, 610, 700, 720, 780, 800, 850, 820],
    },
  ];

  // Data for Maximum Demand (kVA) chart
  const maxDemandOptions: ApexOptions = {
    title: {
      text: 'Maximum Demand (kVA)',
    },
    chart: {
      type: 'line',
    },
    xaxis: {
      categories: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct'],
      title: {
        text: 'Months',
      },
    },
    yaxis: {
      min: 0,
      title: {
        text: 'Demand (kVA)',
      },
    },
    colors: ['#F59E0B'], // Orange
    tooltip: {
      y: {
        formatter: (val: number) => `${val} kVA`,
      },
    },
    dataLabels: {
      enabled: true,
    },
  };

  const maxDemandSeries = [
    {
      name: 'Maximum Demand',
      data: [250, 230, 260, 280, 290, 310, 320, 340, 360, 380],
    },
  ];

  // Data for Daily Demand (kVA) chart
  const dailyDemandOptions: ApexOptions = {
    title: {
      text: 'Daily Demand (kVA)',
    },
    chart: {
      type: 'line',
    },
    stroke: {
      curve: 'smooth',
    },
    xaxis: {
      categories: ['1st', '2nd', '3rd', '4th', '5th', '6th', '7th', '8th', '9th', '10th'],
      title: {
        text: 'Days of the Month',
      },
    },
    yaxis: {
      min: 0,
      title: {
        text: 'Demand (kVA)',
      },
    },
    colors: ['#EF4444'], // Red
    tooltip: {
      y: {
        formatter: (val: number) => `${val} kVA`,
      },
    },
  };

  const dailyDemandSeries = [
    {
      name: 'Daily Demand',
      data: [210, 200, 240, 230, 250, 220, 260, 270, 290, 300],
    },
  ];

  // Data for Peak Shaving Using IOE and LTO chart
  const peakShavingOptions: ApexOptions = {
    title: {
      text: 'Peak Shaving Using IOE and LTO',
    },
    chart: {
      type: 'area',
    },
    stroke: {
      curve: 'smooth',
    },
    xaxis: {
      categories: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct'],
      title: {
        text: 'Months',
      },
    },
    yaxis: {
      min: 0,
      title: {
        text: 'Energy Saved (kWh)',
      },
    },
    colors: ['#34D399', '#60A5FA'], // Green, Blue
    tooltip: {
      shared: true,
      y: {
        formatter: (val: number) => `${val} kWh`,
      },
    },
  };

  const peakShavingSeries = [
    {
      name: 'IOE Peak Shaving',
      data: [150, 130, 170, 160, 180, 200, 220, 210, 230, 240],
    },
    {
      name: 'LTO Peak Shaving',
      data: [140, 120, 160, 150, 170, 190, 210, 200, 220, 230],
    },
  ];

  return (
    <div className="bg-gray-100 min-h-screen p-8">
      {/* Page Title */}
      <div className="mb-8 text-center">
        <h1 className="text-4xl font-bold text-gray-800">Building Energy Overview</h1>
        <p className="text-gray-600 mt-2">Monitor various aspects of building energy</p>
      </div>

      {/* Consumption Summary */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
        <div className="bg-white p-6 rounded-lg shadow-lg">
          <h2 className="text-xl font-semibold text-gray-700">Grid Consumption Overview</h2>
          <p className="text-gray-600 mt-4">
            <strong>Current Month Consumption:</strong> 780 kWh<br />
            <strong>Previous Month Consumption:</strong> 850 kWh<br />
            <strong>Total Consumption (Year):</strong> 6,850 kWh
          </p>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-lg">
          <h2 className="text-xl font-semibold text-gray-700">Wheeled-in Energy Overview</h2>
          <p className="text-gray-600 mt-4">
            <strong>Current Month Wheeled-in Energy:</strong> 520 kWh<br />
            <strong>Previous Month Wheeled-in Energy:</strong> 540 kWh<br />
            <strong>Total Wheeled-in Energy (Year):</strong> 4,360 kWh
          </p>
        </div>
      </div>

      {/* Grid Consumption Chart */}
      <div className="bg-white p-8 rounded-lg shadow-lg mb-12">
        <Chart options={gridConsumptionOptions} series={gridConsumptionSeries} type="bar" height={350} />
      </div>

      {/* Wheeled-in Energy Chart */}
      <div className="bg-white p-8 rounded-lg shadow-lg mb-12">
        <Chart options={wheeledInEnergyOptions} series={wheeledInEnergySeries} type="line" height={350} />
      </div>

      {/* Grid Energy Maximum Chart */}
      <div className="bg-white p-8 rounded-lg shadow-lg mb-12">
        <Chart options={gridEnergyMaxOptions} series={gridEnergyMaxSeries} type="area" height={350} />
      </div>

      {/* Maximum Demand Chart */}
      <div className="bg-white p-8 rounded-lg shadow-lg mb-12">
        <Chart options={maxDemandOptions} series={maxDemandSeries} type="line" height={350} />
      </div>

      {/* Daily Demand Chart */}
      <div className="bg-white p-8 rounded-lg shadow-lg mb-12">
        <Chart options={dailyDemandOptions} series={dailyDemandSeries} type="line" height={350} />
      </div>

      {/* Peak Shaving Using IOE and LTO Chart */}
      <div className="bg-white p-8 rounded-lg shadow-lg">
        <Chart options={peakShavingOptions} series={peakShavingSeries} type="area" height={350} />
      </div>
    </div>
  );
};

export default BuildingOverview;
