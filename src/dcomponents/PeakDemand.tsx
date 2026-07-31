import React, { useEffect, useState, useContext } from "react";
import Chart from "react-apexcharts";
import { ApexOptions } from "apexcharts";
import axios from "axios";
import moment from "moment-timezone";
import { DateContext } from "../contexts/DateContext";
import * as XLSX from 'xlsx';

interface PeakDemandItem {
  minute: string;
  total_kVA: string;
}

const PeakDemand = () => {
  const { startDateTime, endDateTime } = useContext(DateContext)!;
  const [peakDemandData, setPeakDemandData] = useState<PeakDemandItem[]>([]);
  const [warning, setWarning] = useState<string>('');

  const fetchPeakDemandData = async (startDateTime: string, endDateTime: string) => {
    try {
      const response = await axios.get(`${import.meta.env.VITE_API_BASE_URL}/api/opeakdemand`, {
        params: {
          startDateTime,
          endDateTime,
        },
      });
      setPeakDemandData(response.data.peakDemandData);
    } catch (error) {
      console.error("Error fetching peak demand data:", error);
    }
  };

  useEffect(() => {
    if (startDateTime && endDateTime) {
      const start = moment(startDateTime);
      const end = moment(endDateTime);
      const durationHours = end.diff(start, 'hours');

      if (durationHours > 25) {
        setWarning("Only a maximum of 96 data points can be displayed.");
        setPeakDemandData([]);
        return;
      }
      setWarning('');
      fetchPeakDemandData(startDateTime, endDateTime);
    }

},[startDateTime, endDateTime]);

  const downloadExcel = () => {
    if (!peakDemandData || peakDemandData.length === 0) {
      alert("No data available to download.");
      return;
    }

    const headerRow = [`Start: ${startDateTime}`, `End: ${endDateTime}`, ""];

    const columnHeaders = ["Date", "Time", "Peak Demand (kVA)"];

    const formattedData = peakDemandData.map((item) => [
      moment(item.minute).format("YYYY-MM-DD"),
      moment(item.minute).format("HH:mm"),
      parseFloat(item.total_kVA),
    ]);

    const dataForExcel = [headerRow, columnHeaders, ...formattedData];

    const worksheet = XLSX.utils.aoa_to_sheet(dataForExcel);

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Peak Demand Data");

    XLSX.writeFile(workbook, `Peak_Demand_${startDateTime}_to_${endDateTime}.xlsx`);
  };

  const categories = peakDemandData.map((data) => moment(data.minute).format("HH:mm"));

  const options: ApexOptions = {
    chart: {
      type: "line",
      background: "white",
      toolbar: { show: false },
    },
    xaxis: {
      categories,
      title: {
        text: "Hour",
        style: {
          fontWeight: "bold",
        },
      },
    },
    yaxis: {
      min: 0,
      max: 800,
      title: {
        text: "Peak Demand (kVA)",
        style: {
          fontWeight: "bold",
        },
      },
    },
    grid: { show: false },
    colors: ["#1f77b4"],
    annotations: {
      yaxis: [
        {
          y: 745,
          borderColor: "red",
          strokeDashArray: 4,
          label: {
            text: "Upper Ceiling (745 kVA)",
            position: "right",
            style: {
              color: "#fff",
              background: "red",
            },
          },
        },
        {
          y: 596,
          borderColor: "red",
          strokeDashArray: 4,
          label: {
            text: "Lower Ceiling (596 kVA)",
            position: "right",
            style: {
              color: "#fff",
              background: "red",
            },
          },
        },
      ],
    },
    tooltip: {
      shared: true,
      intersect: false,
      custom: ({ series, seriesIndex, dataPointIndex }: any) => {
        const time = categories[dataPointIndex];
        const value = series[seriesIndex][dataPointIndex];
        return `<div style="padding:8px;background:white;border-radius:10px;color:#000;"><b>Time:</b> ${time}<br/><b>Value:</b> ${value} kVA</div>`;
      },
    },
    dataLabels: { enabled: false },
    legend: {
      position: "bottom",
      horizontalAlign: "center",
    },
    responsive: [
      {
        breakpoint: 768,
        options: {
          legend: {
            position: "bottom",
            horizontalAlign: "center",
          },
        },
      },
    ],
  };

  const series = [
    {
      name: "Apparent Power",
      data: peakDemandData.map((data) => parseFloat(data.total_kVA)),
    },
  ];

  return (
    <div className="bg-white shadow-lg rounded-lg p-6 w-full h-full">
      <div className="flex justify-between items-center pb-6">
        <h2 className="text-xl font-semibold">Grid Peak Demand</h2>
        <button
          onClick={downloadExcel}
          className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 transition"
        >
          Download Excel
        </button>
      </div>
      {warning ? (
      <div className="flex items-center justify-center h-64">
        <div className="text-yellow-600 bg-yellow-100 px-6 py-4 rounded-md border border-yellow-300 text-center text-base font-medium">
          {warning}
        </div>
      </div>
    ) : (
      <div className="w-full h-[400px] -translate-x-4">
        <Chart options={options} series={series} type="line" height={400} />
      </div>
    )}
  </div>
  );
};

export default PeakDemand;
