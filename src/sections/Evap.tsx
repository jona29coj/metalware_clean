import Chart from 'react-apexcharts';
import { ApexOptions } from 'apexcharts';

const EvaporatorTemperature = () => {
  const options: ApexOptions = {
    chart: {
      type: 'line',
    },
    title: {
      text: 'Evaporator In/Out Temperature',
    },
    xaxis: {
      categories: ['Phase 1', 'Phase 2'],
    },
    yaxis: {
      title: {
        text: 'Temperature (°C)',
      },
    },
    colors: ['#7cb5ec', '#434348'],
  };

  const series = [
    {
      name: 'Inlet Temperature',
      data: [7, 8],
    },
    {
      name: 'Outlet Temperature',
      data: [4, 5],
    },
  ];

  return (
    <div className="bg-white shadow-lg rounded-lg p-6 mb-8">
      <h2 className="text-2xl font-semibold mb-4">Evaporator In/Out Temperature</h2>
      <Chart options={options} series={series} type="line" height={350} />
    </div>
  );
};

export default EvaporatorTemperature;
