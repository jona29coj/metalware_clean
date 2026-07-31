import Chart from 'react-apexcharts';
import { ApexOptions } from 'apexcharts';

const TotalEnergyAndCooling = () => {
  const options: ApexOptions = {
    chart: {
      type: 'bar',
    },
    title: {
      text: 'Chiller Status',
    },
    xaxis: {
      categories: ['Chiller 1', 'Chiller 2', 'Chiller 3', 'Chiller 4', 'Chiller 5', 'Chiller 6'],
    },
    yaxis: {
      min: 0,
      title: {
        text: 'Status (%)',
      },
    },
    colors: ['#7cb5ec'],
  };

  const series = [
    {
      name: 'Operational Efficiency',
      data: [85, 90, 75, 80, 95, 65],
    },
  ];

  return (
<div className="bg-white shadow-lg rounded-lg p-6 mb-8">
      <h2 className="text-2xl font-semibold mb-4">Today's Energy Overview</h2>

      {/* Mini Cards */}
      <div className="grid grid-cols-2 gap-4 mb-8">
        <div className="bg-blue-100 shadow-md rounded-md p-4">
          <p className="text-lg font-medium">Total Electrical Energy</p>
          <p className="text-2xl font-bold text-blue-700">7526 kWh</p>
        </div>
        <div className="bg-green-100 shadow-md rounded-md p-4">
          <p className="text-lg font-medium">Total Cooling Energy</p>
          <p className="text-2xl font-bold text-green-700">5100 TRh</p>
        </div>
      </div>


      {/* Chillers Status Chart */}
      <div className="mt-6">
        <h3 className="text-xl font-semibold mb-2">Chillers Status</h3>
        <Chart options={options} series={series} type="bar" height={350} />
      </div>
    </div>
  );
};

export default TotalEnergyAndCooling;
