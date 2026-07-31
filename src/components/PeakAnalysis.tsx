import React, { useState, useEffect, useContext } from 'react';
import Chart from 'react-apexcharts';
import { ApexOptions } from 'apexcharts';
import axios from 'axios';
import { useLocation, useNavigate } from 'react-router-dom';
import { DateContext } from '../contexts/DateContext';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';
import moment from 'moment-timezone';

const zoneMetadata = [
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
];

const PeakAnalysis = () => {
  const { startDateTime, endDateTime } = useContext(DateContext)!;
  const location = useLocation();
  const navigate = useNavigate();
  const [warning, setWarning] = useState('');
  const [peakData, setPeakData] = useState<any[]>([]);
  const [selectedView, setSelectedView] = useState(
    new URLSearchParams(location.search).has('zone') ? 'single' : 'all'
  );
  const [selectedZone, setSelectedZone] = useState(
    parseInt(new URLSearchParams(location.search).get('zone') || '') || 1
  );

  useEffect(() => {

    const start = moment(startDateTime);
    const end = moment(endDateTime);
    const durationHours = end.diff(start, 'hours');

    if (durationHours > 25) {
      setWarning('Only a maximum of 96 data points can be displayed.');
      setPeakData([]);
      return;
    } else {
      setWarning('');
    }

    const fetchPeakData = async () => {
      try {
        let formattedData: any[] = [];

        if (selectedView === 'single') {
          const response = await axios.get(`${import.meta.env.VITE_API_BASE_URL}/api/zkVAtest`, {
            params: { startDateTime, endDateTime, zone: selectedZone },
          });
          const meta = zoneMetadata.find((z) => z.id === selectedZone);
          const data = response.data?.kvaData || [];
          formattedData = [{
            zoneId: selectedZone,
            zoneName: meta?.name || `Zone ${selectedZone}`,
            category: meta?.category || '',
            data: data.map((item: any) => ({
              hour: item.minute,
              value: parseFloat(item.total_kva || 0),
            })),
          }];
        } else {
          const response = await axios.get(`${import.meta.env.VITE_API_BASE_URL}/api/zkVAaztest`, {
            params: { startDateTime, endDateTime },
          });

          const allZonesRawData = response.data?.kvaAllZonesData || [];

          const groupedByZone = allZonesRawData.reduce((acc: any, item: any) => {
            const zoneId = item.zone_id;
            if (!acc[zoneId]) {
              acc[zoneId] = [];
            }
            acc[zoneId].push(item);
            return acc;
          }, {});

          formattedData = Object.keys(groupedByZone).map(zoneIdStr => {
            const zoneId = parseInt(zoneIdStr);
            const meta = zoneMetadata.find(z => z.id === zoneId);
            return {
              zoneId: zoneId,
              zoneName: meta?.name || `Zone ${zoneId}`,
              category: meta?.category || '',
              data: groupedByZone[zoneIdStr].map((item: any) => ({
                hour: item.minute,
                value: parseFloat(item.total_kva || 0),
              })),
            };
          }).sort((a,b) => a.zoneId - b.zoneId);
        }

        setPeakData(formattedData);
      } catch (err) {
        console.error("Error fetching peak data:", err);
      }
    };

    fetchPeakData();
  }, [startDateTime, endDateTime, selectedView, selectedZone]);

  const uniqueTimesCategories = [
    ...new Set(peakData.flatMap((zone) => zone.data.map((item: any) => item.hour))),
  ].sort().map((hour: any) => hour.substring(11, 16));

  const chartOptionsAllZones: ApexOptions = {
    chart: {
      type: 'line',
      background: 'white',
      height: 500,
      toolbar: { show: false },
    },
    title: {
      text: 'Peak Demand',
    },
    xaxis: {
      categories: uniqueTimesCategories,
      title: { text: 'Time' },
    },
    yaxis: {
      min: 0,
      title: { text: 'Total kVA per Minute' },
    },
    tooltip: {
      shared: true,
      y: {
        formatter: (val: number) => `${val} kVA`,
      },
    },
    markers: {
      size: 0,
      hover: {
        size: 5,
      },
    },
  };

  const chartSeriesAllZones = peakData.map((zone) => ({
    name: zone.category
    ? `${zone.zoneName} (${zone.category})`
    : zone.zoneName,
    data: uniqueTimesCategories.map((hourCategory) => {
      const fullHourTimestamp = peakData.flatMap(z => z.data)
                                        .find((item: any) => item.hour.substring(11,16) === hourCategory)?.hour;
      const dataPoint = zone.data.find((item: any) => item.hour === fullHourTimestamp);
      return dataPoint ? dataPoint.value : 0;
    }),
  }));

  const chartOptionsSingleZone = (zone: any): ApexOptions => ({
    chart: { type: 'line', background: 'white', height: 500, toolbar: { show: false } },
    title: {
      text: zone.category ? `${zone.zoneName} (${zone.category}) - Peak Demand` : `${zone.zoneName} - Peak Demand`,
    },
    xaxis: {
      categories: zone.data.map((d: any) => d.hour.substring(11, 16)),
    },
    yaxis: {
      title: { text: 'Total kVA per Minute' },
      min: 0,
    },
    markers: {
      size: 0,
      hover: {
        size: 5,
      },
    },
    tooltip: {
      shared: true,
      custom: ({ series, seriesIndex, dataPointIndex }: any) => {
        const time = zone.data[dataPointIndex]?.hour.split(" ")[1];
        const value = series[seriesIndex][dataPointIndex];
        return `<div style="padding:8px;background:white;border-radius:10px;color:#000;"><b>Time:</b> ${time}<br/><b>Value:</b> ${value} kVA</div>`;
      },
    },
  });

  const chartSeriesSingleZone = (zone: any) => [
    {
      name: zone.zoneName,
      data: zone.data.map((d: any) => d.value),
    },
  ];

  const handleDownloadExcel = () => {
    if (!peakData || peakData.length === 0) {
      alert("No data available to download.");
      return;
    }

    const workbook = XLSX.utils.book_new();

    if (selectedView === 'single') {
      const currentZoneData = peakData.find(zone => zone.zoneId === selectedZone);
      if (!currentZoneData || currentZoneData.data.length === 0) {
        alert("No data available for the selected single zone to download.");
        return;
      }

      const zoneName = currentZoneData.zoneName;
      const category = currentZoneData.category;

      const zoneDisplay = category ? `${zoneName} (${category})` : zoneName;

      const headerRow1 = [`Zone: ${zoneDisplay}`, "", ""];
      const headerRow2 = [`Start Date Time: ${startDateTime}`, `End Date Time: ${endDateTime}`, ""];
      const columnHeaders = ["Date", "Time", "Total kVA"];

      const formattedData = currentZoneData.data.map((item: any) => [
        moment(item.hour).format("YYYY-MM-DD"),
        moment(item.hour).format("HH:mm:ss"),
        item.value,
      ]);

      const dataForExcel = [headerRow1, headerRow2, [], columnHeaders, ...formattedData];
      const worksheet = XLSX.utils.aoa_to_sheet(dataForExcel);

      let sheetNameForExcel;
      if (zoneName === "DIE CASTING + CHINA BUFFING + CNC") {
        sheetNameForExcel = "DC+CB+CNC kVA Data";
      } else {
        sheetNameForExcel = `${zoneName} kVA Data`;
        if (sheetNameForExcel.length > 31) {
          sheetNameForExcel = sheetNameForExcel.substring(0, 31);
        }
      }
      XLSX.utils.book_append_sheet(workbook, worksheet, sheetNameForExcel);

      const filename = `${zoneName.replace(/[\s\+]/g, '_')}_kVA_Data.xlsx`;
      XLSX.writeFile(workbook, filename);

    } else {
      const headerRow = [`Start: ${startDateTime}`, `End: ${endDateTime}`];
      const columnHeaders = [
        "Date",
        "Time",
        ...peakData.map((zone) =>
          zone.category
            ? `${zone.zoneName} (${zone.category}) - kVA`
            : `${zone.zoneName} - kVA`
        ),
      ];
      const uniqueTimes = [
        ...new Set(
          peakData.flatMap((zone) =>
            zone.data.map((item: any) => moment(item.hour).format("YYYY-MM-DD HH:mm"))
          )
        ),
      ].sort();

      const formattedData = uniqueTimes.map((time) => {
        const [date, hour] = time.split(" ");
        const row: any[] = [date, hour];

        peakData.forEach((zone) => {
          const zoneDataForTime = zone.data.find(
            (item: any) => moment(item.hour).format("YYYY-MM-DD HH:mm") === time
          );
          row.push(zoneDataForTime ? zoneDataForTime.value : 0);
        });
        return row;
      });

      const dataForExcel = [headerRow, [], columnHeaders, ...formattedData];
      const worksheet = XLSX.utils.aoa_to_sheet(dataForExcel);

      XLSX.utils.book_append_sheet(workbook, worksheet, "All Zones Peak kVA");

      const fileName = `All_Zones_Peak_kVA_data.xlsx`;
      XLSX.writeFile(workbook, fileName);
    }
  };

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
          {selectedView === 'single' && (
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
               {zone.name}{zone.category ? ` (${zone.category})` : ""}
             </option>

              ))}
            </select>
          )}
        </div>
        <div className='flex flex-end space-x-3'>
          <button
            onClick={handleDownloadExcel}
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
      ):
       selectedView === 'all' ? (
        <Chart options={chartOptionsAllZones} series={chartSeriesAllZones} type="line" height={500} />
      ) : (
        peakData
          .filter((zone) => zone.zoneId === selectedZone)
          .map((zone) => (
            <div key={zone.zoneId} className="bg-white p-5 rounded-md shadow-sm">
              <Chart options={chartOptionsSingleZone(zone)} series={chartSeriesSingleZone(zone)} type="line" height={500} />
            </div>
          ))
      )}
    </div>
  );
};

export default PeakAnalysis;
