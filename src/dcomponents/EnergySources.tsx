import React, { useEffect, useState, useContext } from "react";
import Chart from "react-apexcharts";
import { ApexOptions } from "apexcharts";
import axios from "axios";
import { DateContext } from "../contexts/DateContext";

interface MeterInfo {
  id: number;
  name: string;
  category: string;
}

interface ZoneInfo {
  meter_id: string | number;
  consumption: number;
}

const meterNames: MeterInfo[] = [
  { id: 1, name: "PLATING", category: "C-49" },
  { id: 2, name: "DIE CASTING + CHINA BUFFING + CNC", category: "C-50" },
  { id: 3, name: "SCOTCH BUFFING", category: "C-50" },
  { id: 4, name: "BUFFING", category: "C-49" },
  { id: 5, name: "SPRAY+EPL-I", category: "C-49" },
  { id: 6, name: "SPRAY+ EPL-II", category: "C-50" },
  { id: 7, name: "RUMBLE", category: "C-50" },
  { id: 8, name: "AIR COMPRESSOR", category: "C-49" },
  { id: 9, name: "TERRACE", category: "C-49" },
  { id: 10, name: "TOOL ROOM", category: "C-50" },
  { id: 11, name: "ADMIN BLOCK", category: "C-50" },
];

const getMeterName = (id: string | number) => {
  const meter = meterNames.find((meter) => meter.id === id);
  return meter ? meter.name : "Unknown";
};

const EnergySources = () => {
  // NOTE: `selectedDate` is not part of DateContextValue (see src/contexts/DateContext.tsx) — it does not
  // exist on the context and was already effectively undefined/dead in the original JSX. Preserved as-is
  // via an `any` cast on the context value so the destructure keeps compiling; the useEffect below that
  // depends on it is a no-op in the original code too.
  const contextValue = useContext(DateContext) as any;
  const { selectedDate: globalSelectedDate, startDateTime: globalStartDateTime, endDateTime: globalEndDateTime } = contextValue;
  const [zones, setZones] = useState<ZoneInfo[]>([]);
  const [highZone, setHighZone] = useState<ZoneInfo>({ meter_id: "N/A", consumption: 0 });
  const [lowZone, setLowZone] = useState<ZoneInfo>({ meter_id: "N/A", consumption: 0 });

  useEffect(() => {
  }, [globalSelectedDate]);

const fetchConsumptionData = async (date?: string) => {
  try {
    const response = await axios.get(`${import.meta.env.VITE_API_BASE_URL}/api/hlcons`, {
      params: {
        startDateTime: globalStartDateTime,
        endDateTime: globalEndDateTime,
      },
    });

    if (response.data) {
      setZones(response.data.consumptionData);
      setHighZone(response.data.highZone);
      setLowZone(response.data.lowZone);
    }
  } catch (err) {
    console.error("Error fetching data:", err);
  }
};

useEffect(() => {
  fetchConsumptionData();
}, [globalStartDateTime, globalEndDateTime]);


  const totalConsumption = zones.reduce((sum, zone) => sum + parseFloat(zone.consumption as any), 0);

  const otherZonesConsumption = (totalConsumption - (highZone.consumption + lowZone.consumption)).toFixed(1);

  const chartOptions: ApexOptions = {
    chart: {
      type: "bar",
      background: "transparent",
      height: 300,
      stacked: true,
      toolbar: { show: false },
    },
    xaxis: { categories: ["Total Consumption"] },
    yaxis: { title: { text: "Consumption (kVAh)" } },
    plotOptions: {
      bar: {
        borderRadius: 0,
      },
    },
    dataLabels: { enabled: false },
    colors: ["rgb(185, 28, 28)", "rgba(96, 165, 250, 0.2)", "rgb(21, 128, 61)"],
    tooltip: {
      custom: ({ series, seriesIndex, dataPointIndex, w }: any) => {
        const name = w.config.series[seriesIndex].name;
        if (name === "Other Zones") {
          return `<div style="padding:8px;"><b>Other Zones:</b> ${otherZonesConsumption} kVAh</div>`;
        }
        return `<div style="padding:8px;"><b>${name}:</b> ${series[seriesIndex][dataPointIndex]} kVAh</div>`;
      },
    },
    legend: { show: true },
  };

  const series = [
    { name: `High Zone (${getMeterName(highZone.meter_id)})`, data: [highZone.consumption] },
    { name: "Other Zones", data: [parseFloat(otherZonesConsumption)] },
    { name: `Low Zone (${getMeterName(lowZone.meter_id)})`, data: [lowZone.consumption] },
  ];

  return (
    <div className="bg-white xl:h-[100%] p-7 rounded-lg shadow-md flex flex-col space-y-7">
        <h2 className="text-xl font-semibold">Facility Overview</h2>
        <div className="grid grid-cols-2 gap-6">
          <div>
            <div className="xl:space-y-5 lg:space-y-4 md:space-y-4">
              <div className="border border-red-500 p-3 rounded-lg shadow">
                <h3 className="md:text-sm l:text-md xl:text-md font-semibold text-red-700">High Zone</h3>
                <p className="md:text-xs l:text-xs xl:text-sm text-gray-900 text-sm mt-2">Zone: {getMeterName(highZone.meter_id)}</p>
                <p className="md:text-xs l:text-xs xl:text-sm text-gray-900 text-sm mt-1">{highZone.consumption} kVAh</p>
                <p className="md:text-xs l:text-xs xl:text-sm text-sm text-gray-600 mt-1">{((highZone.consumption / totalConsumption) * 100).toFixed(1)}% of Total Consumption</p>
              </div>
              <div className="border border-green-500 p-3 rounded-lg shadow">
                <h3 className="md:text-sm l:text-md xl:text-md font-semibold text-green-700">Low Zone</h3>
                <p className="md:text-xs l:text-xs xl:text-sm text-gray-900 text-sm mt-2">Zone: {getMeterName(lowZone.meter_id)}</p>
                <p className="md:text-xs l:text-xs xl:text-sm text-gray-900 text-sm mt-1">{lowZone.consumption} kVAh</p>
                <p className="md:text-xs l:text-xs xl:text-sm text-sm text-gray-600 mt-1">{((lowZone.consumption / totalConsumption) * 100).toFixed(1)}% of Total Consumption</p>
              </div>
              <div className="border border-blue-500 p-3 rounded-lg shadow">
                <h3 className="md:text-sm l:text-md xl:text-md font-semibold text-blue-700">Other Zones</h3>
                <p className="md:text-xs l:text-xs xl:text-sm text-gray-900 text-sm mt-1">{otherZonesConsumption} kVAh</p>
                <p className="md:text-xs l:text-xs xl:text-sm text-sm text-gray-600 mt-1">{((parseFloat(otherZonesConsumption) / totalConsumption) * 100).toFixed(1)}% of Total Consumption</p>
              </div>
            </div>
          </div>
          <div className="flex justify-center items-center mt-6 pt-8">
            <Chart options={chartOptions} series={series} type="bar" height={300} />
          </div>
        </div>
    </div>
  );
};

export default EnergySources;
