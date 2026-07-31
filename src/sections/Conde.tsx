import Chart from 'react-apexcharts';
import { ApexOptions } from 'apexcharts';

const CondenserTemperature = () => {
  const options: ApexOptions = {
    chart: {
      type: 'line',
    },
    title: {
      text: 'Condenser In/Out Temperature',
    },
    xaxis: {
      categories: ['Phase 1', 'Phase 2'],
    },
    yaxis: {
      title: {
        text: 'Temperature (°C)',
      },
    },
    colors: ['#f45b5b', '#91e8e1'],
  };

  const series = [
    {
      name: 'Inlet Temperature',
      data: [30, 32],
    },
    {
      name: 'Outlet Temperature',
      data: [27, 28],
    },
  ];

  return (
    <div className="bg-white shadow-lg rounded-lg p-6 mb-8">
      <h2 className="text-2xl font-semibold mb-4">Condenser In/Out Temperature</h2>
      <Chart options={options} series={series} type="line" height={350} />
    </div>
  );
};

export default CondenserTemperature;
