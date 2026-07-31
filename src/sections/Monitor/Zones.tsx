import { useState, useEffect, useContext } from 'react';
import Chart from 'react-apexcharts';
import { ApexOptions } from 'apexcharts';
import axios from 'axios';
import { useLocation, useNavigate } from 'react-router-dom';
import { DateContext } from '../../contexts/DateContext';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';
import moment from "moment-timezone";

interface ZoneMeta {
  id: number;
  name: string;
  category?: string;
}

// Distinct per-zone colors — ApexCharts' default 8-color palette repeats once
// there are more series than that, which made zones like PLATING and
// SPRAY+EPL-II render as the same blue in the stacked chart.
const ZONE_COLORS = [
  '#2563eb', '#16a34a', '#f59e0b', '#dc2626', '#9333ea', '#0891b2',
  '#db2777', '#65a30d', '#ea580c', '#4338ca', '#0d9488', '#78716c',
];

const zoneMetadata: ZoneMeta[] = [
  { id: 1, name: "PLATING", category: "C-49" },
  { id: 2, name: "DIE CASTING + CHINA BUFFING + CNC", category: "C-50" },
  { id: 3, name: "SCOTCH BUFFING", category: "C-50" },
  { id: 4, name: "BUFFING", category: "C-49" },
  { id: 5, name: "SPRAY+EPL-I", category: "C-50" },
  { id: 6, name: "SPRAY+EPL-II", category: "C-49" },
  { id: 7, name: "RUMBLE", category: "C-50" },
  { id: 8, name: "AIR COMPRESSOR", category: "C-49" },
  { id: 9, name: "TERRACE", category: "C-49" },
  { id: 10, name: "TOOL ROOM", category: "C-50" },
  { id: 11, name: "ADMIN BLOCK", category: "C-50" },
  { id: 12, name: "TRANSFORMER" }
];

interface ZoneDataEntry {
  zoneId: number;
  zoneName: string;
  category: string;
  data: { hour: string; value: number }[];
}

const Zones = () => {
  const { startDateTime, endDateTime } = useContext(DateContext) as any;
  const location = useLocation();
  const navigate = useNavigate();
  const [warning, setWarning] = useState('');
  const [zoneData, setZoneData] = useState<ZoneDataEntry[]>([]);
  const [selectedView, setSelectedView] = useState(
    new URLSearchParams(location.search).has('zone') ? 'single' : 'all'
  );
  const [selectedZone, setSelectedZone] = useState(
    parseInt(new URLSearchParams(location.search).get('zone') || '') || 1
  );
  const [consumptionType, setConsumptionType] = useState('kVAh');

  useEffect(() => {
    const start = moment(startDateTime);
    const end = moment(endDateTime);
    const durationHours = end.diff(start, 'hours');

    if (durationHours > 24) {
      setWarning('Only a maximum of 24 hourly values can be displayed.');
      setZoneData([]);
      return;
    } else {
      setWarning('');
    }
    const fetchZoneData = async () => {
      try {
        const isAllZones = selectedView === 'all';

        let endpoint = isAllZones
          ? (consumptionType === 'kWh' ? 'zkWhAZconsumptiontest' : 'zkVAhAZconsumptiontest')
          : (consumptionType === 'kWh' ? 'zconsumptiontest' : 'zkVAhconsumptiontest');

        let response;
        if (isAllZones) {
          response = await axios.get(`${import.meta.env.VITE_API_BASE_URL}/api/${endpoint}`, {
            params: { startDateTime, endDateTime },
          });
        } else {
          response = await axios.get(`${import.meta.env.VITE_API_BASE_URL}/api/${endpoint}`, {
            params: { startDateTime, endDateTime, zone: selectedZone },
          });
        }

        const data = response.data?.consumptionData || [];

        const groupedData = data.reduce((acc: Record<string, any[]>, item: any) => {
          const zoneId = item.energy_meter_id;
          if (!acc[zoneId]) {
            acc[zoneId] = [];
          }
          acc[zoneId].push(item);
          return acc;
        }, {});

        const formattedData = zoneMetadata
          .filter(zone => Object.keys(groupedData).includes(zone.id.toString()))
          .map(zone => {
            const zoneData = groupedData[zone.id] || [];
            const parsedData = zoneData.map((item: any) => ({
              hour: item.hour,
              value: parseFloat(
                consumptionType === 'kWh' ? item.kwh_difference || 0 : item.kvah_difference || 0 ) }));

            return {
              zoneId: zone.id,
              zoneName: zone.name,
              category: zone.category || '',
              data: parsedData,
            };
          });

        setZoneData(formattedData);
      } catch (error) {
        console.error('Error fetching zone data:', error);
      }
    };

    fetchZoneData();
  }, [startDateTime, endDateTime, consumptionType, selectedView, selectedZone]);


  const downloadExcel = () => {
    if (!zoneData?.length) return;
    const headerRow = [`Start: ${startDateTime}`, `End: ${endDateTime}`, "", "", ""];
    const columnHeaders = ["Date", "Time", ...zoneData.map((zone) => `${zone.zoneName}${zone.category ? ` (${zone.category})` : ''} - ${consumptionType}`)];
    const uniqueTimes = [
      ...new Set(
        zoneData.flatMap((zone) =>
          zone.data.map((item) => moment(item.hour).format("YYYY-MM-DD HH:mm"))
        )
      ),
    ].sort();
    const formattedData = uniqueTimes.map((time) => {
      const [date, hour] = time.split(" ");
      const row: (string | number)[] = [date, hour];

      zoneData.forEach((zone) => {
        const zoneDataForTime = zone.data.find(
          (item) => moment(item.hour).format("YYYY-MM-DD HH:mm") === time
        );
        row.push(zoneDataForTime ? zoneDataForTime.value : 0);
      });

      return row;
    });

    const dataForExcel = [headerRow, columnHeaders, ...formattedData];

    const worksheet = XLSX.utils.aoa_to_sheet(dataForExcel);

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Zones Consumption");

    const excelBuffer = XLSX.write(workbook, { bookType: "xlsx", type: "array" });
    const fileName = `Zones_Consumption_${startDateTime}_to_${endDateTime}.xlsx`;
    saveAs(new Blob([excelBuffer], { type: "application/octet-stream" }), fileName);
  };

  const allZonesHours = [
    ...new Set(zoneData.flatMap((zone) => zone.data.map((item) => item.hour))),
  ];

  const chartOptionsAllZones: ApexOptions = {
    chart: {
      type: 'bar',
      background: 'white',
      height: 500,
      stacked: true,
      toolbar: { show: false },
    },
    title: {
      text: 'Hourly Consumption',
    },
    colors: ZONE_COLORS,
    xaxis: {
      categories: allZonesHours.map((hour) => hour.substring(11, 16)),
      title: { text: 'Time' },
      tickAmount: 12,
      labels: { rotate: 0 },
    },
    yaxis: {
      min: 0,
      title: { text: `Energy Consumption (${consumptionType})` },
    },
    grid: {
      xaxis: { lines: { show: false } },
      yaxis: { lines: { show: false } },
    },
    tooltip: {
      shared: true,
      intersect: false,
      custom: ({ series, dataPointIndex, w }: any) => {
        let total = 0;
        let rows = '';
        w.config.series.forEach((s: any, idx: number) => {
          const val = series[idx][dataPointIndex] || 0;
          total += val;
          rows += `<div>${s.name}: ${val} ${consumptionType}</div>`;
        });
        return `<div style="padding:8px;background:white;border-radius:6px;">${rows}<div><b>Total: ${total} ${consumptionType}</b></div></div>`;
      },
    },
    plotOptions: {
      bar: {
        dataLabels: {
          total: {
            enabled: false,
          },
        },
      },
    },
    dataLabels: {
      enabled: false,
    },
  };

  const chartSeriesAllZones = zoneData.map((zone) => ({
    name: `${zone.zoneName} (${zone.category})`,
    data: allZonesHours.map((hour) => zone.data.find((item) => item.hour === hour)?.value || 0),
  }));

  const getChartOptionsSingleZone = (zone: ZoneDataEntry): ApexOptions => ({
    chart: { type: 'bar', background: 'white', height: 500, toolbar: { show: false } },
    title: {
      text: `${zone.zoneName}${zone.category ? ` (${zone.category})` : ''} - Hourly Consumption`,
    },
    xaxis: {
      categories: zone.data.map((item) => item.hour.substring(11, 16)),
      tickAmount: 12,
      labels: { rotate: 0 },
    },
    yaxis: {
      min: 0,
      title: { text: `Energy Consumption (${consumptionType})` },
    },
    grid: {
      xaxis: { lines: { show: false } },
      yaxis: { lines: { show: false } },
    },
    dataLabels: {
      enabled: false,
    },
    tooltip: {
      shared: true,
      intersect: false,
      y: {
        formatter: (val: number) => `${val} ${consumptionType}`,
      },
    },
  });

  const handleViewChange = (view: string) => {
    setSelectedView(view);
    const params = new URLSearchParams();
    if (view === 'single') params.set('zone', String(selectedZone));
    navigate(`?${params.toString()}`, { replace: true });
  };

  return (
    <div className="p-4 bg-gray-100 min-h-screen">
      <div className="mb-6 flex justify-between items-center">
        <div className='flex gap-2'>
        <div className="inline-flex rounded-md shadow-sm" role="group">
          <button
            onClick={() => handleViewChange('all')}
            className={`px-4 py-2 text-sm font-medium rounded-l-lg border ${
              selectedView === 'all' ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
            }`}
          >
            All Zones
          </button>
          <button
            onClick={() => handleViewChange('single')}
            className={`px-4 py-2 text-sm font-medium rounded-r-lg border ${
              selectedView === 'single' ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
            }`}
          >
            Select Zone
          </button>
        </div>
        {
        selectedView === 'single' && (
         <select
         value={selectedZone}
         onChange={(e) => {
           const zoneId = parseInt(e.target.value);
           setSelectedZone(zoneId);
           navigate(`?zone=${zoneId}`, { replace: true });
         }}
         className="px-3 py-2 border border-gray-300 rounded-md text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
       >
         {zoneMetadata.map((zone) => (
           <option key={zone.id} value={zone.id}>
             {zone.name} {zone.category ? `(${zone.category})` : ''}
           </option>
         ))}
       </select>
        )}
        </div>
        <div className='flex flex-end space-x-3'>
          <div className="flex bg-white rounded-full p-1 space-x-1">
            <button
              onClick={() => setConsumptionType('kVAh')}
              className={`px-6 py-2 text-sm font-medium rounded-full transition ${
                consumptionType === 'kVAh' ? 'bg-blue-600 text-white' : 'bg-transparent text-gray-700 hover:bg-blue-50'
              }`}
            >
              kVAh
            </button>
            <button
              onClick={() => setConsumptionType('kWh')}
              className={`px-6 py-2 text-sm font-medium rounded-full transition ${
                consumptionType === 'kWh' ? 'bg-blue-600 text-white' : 'bg-transparent text-gray-700 hover:bg-blue-50'
              }`}
            >
              kWh
            </button>
          </div>
          <button
              onClick={downloadExcel}
              className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 transition"
            >
              Download Excel
            </button>
          </div>
      </div>

     { warning ? (
          <div className="flex items-center justify-center h-64">
          <div className="text-yellow-600 bg-yellow-100 px-6 py-4 rounded-md border border-yellow-300 text-center text-base font-medium">
            {warning}
          </div>
        </div>
     ) : selectedView === 'all' ? (
        <Chart options={chartOptionsAllZones} series={chartSeriesAllZones} type="bar" height={500} />
      ) : (
        zoneData
          .filter((zone) => zone.zoneId === selectedZone)
          .map((zone) => (
            <div key={zone.zoneId} className="bg-white p-5 rounded-md shadow-sm">
              <Chart
                options={getChartOptionsSingleZone(zone)}
                series={[{ name: zone.zoneName, data: zone.data.map((item) => item.value) }]}
                type="bar"
                height={500}
              />
            </div>
          ))
      )}
    </div>
  );
};

export default Zones;
