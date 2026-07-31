import { useState, useEffect, ChangeEvent } from 'react';
import Chart from 'react-apexcharts';
import { ApexOptions } from 'apexcharts';
import axios from 'axios';
import * as XLSX from 'xlsx';


const MonthlyConsumption = () => {
  const [year, setYear] = useState(new Date().getFullYear());
  const [monthlyConsumption, setMonthlyConsumption] = useState<number[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      const currentTime = new Date().toISOString().replace('T', ' ').substr(0, 19);

      try {
        const response = await axios.get(`${import.meta.env.VITE_API_BASE_URL}/api/mbconsumption`, {
          params: {
            year: year,
            currentTime: currentTime,
          },
        });

        const roundedData = response.data.monthlyConsumption.map((value: any) => parseFloat(value).toFixed(1)).map((value: string) => parseFloat(value));
        setMonthlyConsumption(roundedData);
      } catch (error) {
        console.error('Error fetching monthly consumption:', error);
      }
    };

    fetchData();
  }, [year]);

  const handleYearChange = (e: ChangeEvent<HTMLInputElement>) => {
    setYear(Number(e.target.value));
  };

  const downloadExcel = () => {
    if (!monthlyConsumption || monthlyConsumption.length === 0) {
      alert("No data available to download.");
      return;
    }

    const headerRow = [`Year: ${year}`, "", "", "", ""];
    const columnHeaders = ["Month", "Consumption (kWh)"];

    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const formattedData = monthlyConsumption.map((value, index) => [months[index], value]);

    const dataForExcel = [headerRow, columnHeaders, ...formattedData];

    const worksheet = XLSX.utils.aoa_to_sheet(dataForExcel);

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Monthly Consumption");

    XLSX.writeFile(workbook, `Monthly_Consumption_${year}.xlsx`);
  };


  const chartOptions: ApexOptions = {
    chart: {
      type: 'bar',
      toolbar: { show: false },
    },
    title: {
      text: undefined
    },
    xaxis: {
      categories: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
      title: {
        text: undefined
      },
    },
    yaxis: {
      min: 0,
      title: {
        text: 'Energy (kWh)'
      },
    },
    grid: {
      xaxis: { lines: { show: false } },
      yaxis: { lines: { show: false } },
    },
    colors: ['#34D399'],
    tooltip: {
      y: {
        formatter: (val: number) => `${val} kWh`,
      },
    },
    plotOptions: {
      bar: {
        columnWidth: '70%',
      },
    },
    dataLabels: {
      enabled: false
    },
  };

  const chartSeries = [
    {
      name: 'Consumption',
      data: monthlyConsumption,
    }
  ];

  return (
    <div>
    <div className="flex justify-between items-center mb-4">
      <h2 className="text-lg font-semibold">Grid Consumption (kWh)</h2>

      <div className="flex items-center space-x-4">
        <div className="flex items-center">
          <label htmlFor="year-picker" className="mr-2 text-sm font-medium">Year:</label>
          <input
            id="year-picker"
            type="number"
            value={year}
            onChange={handleYearChange}
            min="2000"
            max={new Date().getFullYear()}
            className="border rounded p-1 text-sm w-20"
          />
        </div>
        <button
          onClick={downloadExcel}
          className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 transition"
        >
          Download Excel
        </button>
      </div>
    </div>

    <Chart options={chartOptions} series={chartSeries} type="bar" height={350} />
  </div>
  );
};

export default MonthlyConsumption;
