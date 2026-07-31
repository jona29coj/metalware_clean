import Chart from 'react-apexcharts';
import { ApexOptions } from 'apexcharts';

const LoadingVsCop = () => {
  const options: ApexOptions = {
    chart: {
      type: 'scatter',
    },
    title: {
      text: 'Loading (%) vs COP',
    },
    xaxis: {
      title: {
        text: 'Loading (%)',
      },
    },
    yaxis: {
      title: {
        text: 'COP',
      },
    },
    colors: ['#2b908f'],
  };

  const series = [
    {
      name: 'Chillers',
      data: [
        [70, 3.2],
        [75, 3.5],
        [80, 3.0],
        [65, 3.8],
        [85, 4.1],
      ],
    },
  ];

  return (
    <div className="bg-white shadow-lg rounded-lg p-6 mb-8">
      <h2 className="text-2xl font-semibold mb-4">Loading (%) vs COP</h2>
      <Chart options={options} series={series} type="scatter" height={350} />
    </div>
  );
};

export default LoadingVsCop;
