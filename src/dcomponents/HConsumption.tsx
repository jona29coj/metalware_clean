import React, { useEffect, useState, useContext } from "react";
import Chart from "react-apexcharts";
import { ApexOptions } from "apexcharts";
import 'tailwindcss/tailwind.css';
import axios from 'axios';
import moment from 'moment-timezone';
import { DateContext } from "../contexts/DateContext";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";

type ConsumptionType = 'kVAh' | 'kWh' | '₹';

const HConsumption = () => {
  const { startDateTime, endDateTime } = useContext(DateContext)!;
  const options: ConsumptionType[] = ['kVAh', 'kWh', '₹'];
  const [warning, setWarning] = useState<string>('');
  const [energyData, setEnergyData] = useState<Record<string, any>>({});
  const [consumptionType, setConsumptionType] = useState<ConsumptionType>('kVAh');

  useEffect(() => {
      const start = moment(startDateTime);
      const end = moment(endDateTime);
      const durationHours = end.diff(start, 'hours');

      if (durationHours > 24) {
        setWarning('Only a maximum of 24 hourly values can be displayed.');
        setEnergyData({});
        return;
      } else {
        setWarning('');
      }

      const fetchData = async () => {
      try {
        let endpoint;
        if (consumptionType === 'kWh') {
          endpoint = 'hconsumption';
        } else if (consumptionType === 'kVAh') {
          endpoint = 'hkVAhconsumption';
        } else if (consumptionType === '₹') {
          endpoint = 'hcostconsumption';
        }

        const response = await axios.get(`${import.meta.env.VITE_API_BASE_URL}/api/${endpoint}`, {
          params: {
            startDateTime,
            endDateTime
          }
        });

        setEnergyData(response.data.consumptionData);

      } catch (error) {
        throw error;
      }
    };

    if (startDateTime && endDateTime) {
      fetchData();
    }
  }, [startDateTime, endDateTime, consumptionType]);

  const downloadExcel = () => {
    const headerRow = [`Start: ${startDateTime}`, `End: ${endDateTime}`, ""];

    const columnHeaders = ["Date", "Time", `Value (${consumptionType})`];
    const formattedData = Object.entries(energyData).map(([timestamp, value]) => [
      moment(timestamp, 'YYYY-MM-DD HH:mm:ss').format('YYYY-MM-DD'),
      moment(timestamp, 'YYYY-MM-DD HH:mm:ss').format('HH:mm'),
      parseFloat(value),
    ]);

    const dataForExcel = [
      headerRow,
      columnHeaders,
      ...formattedData,
    ];

    const worksheet = XLSX.utils.aoa_to_sheet(dataForExcel);

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Hourly Consumption");

    const excelBuffer = XLSX.write(workbook, { bookType: "xlsx", type: "array" });
    const fileName = `Hourly_Consumption_${startDateTime}_to_${endDateTime}.xlsx`;
    saveAs(new Blob([excelBuffer], { type: "application/octet-stream" }), fileName);
  };


const chartSeriesData = Object.entries(energyData).map(([timestamp, value]) => {
  const hour = moment(timestamp, 'YYYY-MM-DD HH:mm:ss').hour();
  let color;

  if (hour >= 5 && hour < 10) {
    color = "rgba(76, 175, 80, 0.7)";
  } else if ((hour >= 10 && hour < 19) || (hour >= 3 && hour < 5)) {
    color = "rgba(255, 152, 0, 0.7)";
  } else {
    color = "rgba(244, 67, 54, 0.7)";
  }

  return {
    x: moment(timestamp, 'YYYY-MM-DD HH:mm:ss').format('HH:mm'),
    y: parseFloat(value),
    fillColor: color,
  };
});

const chartOptions: ApexOptions = {
  chart: {
    type: "bar",
    background: "transparent",
    toolbar: { show: false },
  },
  xaxis: {
    type: 'category',
    labels: { show: true },
  },
  yaxis: {
    min: 0,
    title: { text: undefined },
  },
  plotOptions: {
    bar: {
      columnWidth: '70%',
    },
  },
  dataLabels: {
    enabled: false,
  },
  tooltip: {
    shared: true,
    y: {
      formatter: (val: number) => `${val} ${consumptionType}`,
    },
  },
  legend: { show: false },
};

const chartSeries = [
  {
    name: consumptionType === '₹' ? "Cost" : "Energy Consumption",
    data: chartSeriesData,
  },
];

  return (
    <div className="w-full flex flex-col p-6 bg-white shadow-lg rounded-lg">
    <div className="flex justify-between items-center pb-6">
      <h2 className="text-xl font-semibold">Hourly Energy Consumption</h2>
      <div className="flex items-center space-x-4">
        <div className="relative flex items-center bg-gray-50 rounded-full w-56 h-12 shadow-md border border-gray-200">
          {options.map((option, index) => (
            <React.Fragment key={option}>
              <button
                className={`flex-1 h-full flex items-center justify-center text-sm font-medium rounded-full transition-all duration-300 ${
                  consumptionType === option
                    ? 'bg-blue-500 text-white shadow-md'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
                onClick={() => setConsumptionType(option)}
              >
                {option}
              </button>
              {index < options.length - 1 && (
                <div className="w-px h-8 bg-gray-200 mx-1"></div>
              )}
            </React.Fragment>
          ))}
        </div>
        <button
          onClick={downloadExcel}
          className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 transition"
        >
          Download Excel
        </button>
      </div>
    </div>

    {warning ? (
      <div className="flex items-center justify-center h-64">
        <div className="text-yellow-600 bg-yellow-100 px-6 py-4 rounded-md border border-yellow-300 text-center text-base font-medium">
          {warning}
        </div>
      </div>
    ) : (
      <>
        <div className="w-full h-[400px]">
          <Chart options={chartOptions} series={chartSeries} type="bar" height={400} />
        </div>
        <div className="flex justify-center mt-4">
          <div className="flex space-x-6">
            <div className="flex items-center space-x-2">
              <div className="w-4 h-4 bg-[rgba(244,67,54,0.7)] rounded"></div>
              <span className="text-sm text-gray-700 font-medium">Peak</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-4 h-4 bg-[rgba(255,152,0,0.7)] rounded"></div>
              <span className="text-sm text-gray-700 font-medium">Normal</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-4 h-4 bg-[rgba(76,175,80,0.7)] rounded"></div>
              <span className="text-sm text-gray-700 font-medium">Off-Peak</span>
            </div>
          </div>
        </div>
      </>
    )}
  </div>
  );
};

export default HConsumption;
