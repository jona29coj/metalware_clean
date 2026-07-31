import Chart from 'react-apexcharts';
import { ApexOptions } from 'apexcharts';

const InstantaneousChillerCop = () => {
  const options: ApexOptions = {
    chart: {
      type: 'line',
    },
    title: {
      text: 'Chiller COP / Loading',
    },
    xaxis: {
      categories: ['Chiller 1', 'Chiller 2', 'Chiller 3', 'Chiller 4', 'Chiller 5'],
    },
    yaxis: {
      title: {
        text: 'COP / Loading',
      },
    },
    colors: ['#90ed7d', '#f45b5b'],
  };

  const series = [
    {
      name: 'COP',
      data: [3.2, 3.5, 3.0, 3.8, 4.1],
    },
    {
      name: 'Loading (%)',
      data: [70, 75, 80, 65, 85],
    },
  ];

  return (
    <div className="bg-white shadow-lg rounded-lg p-6 mb-8">
      <h2 className="text-2xl font-semibold mb-4">Instantaneous Chiller COP / Loading</h2>
      <Chart options={options} series={series} type="line" height={350} />
    </div>
  );
};

export default InstantaneousChillerCop;
