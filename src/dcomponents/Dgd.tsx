import React, { useContext, useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Chart from "react-apexcharts";
import { ApexOptions } from "apexcharts";
import dg from "../sections/pictures/Diesel tank.png";
import { DateContext } from "../contexts/DateContext";
import moment from "moment-timezone";

interface ConsumptionDataPoint {
  y: number;
  originalTimestamp: string;
}

interface AlertData {
  meter: number;
  timestamp: string;
  status: string;
  kWh: number;
  startTime?: string;
  startKWh?: number;
}

const Dgd = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { startDateTime, endDateTime } = useContext(DateContext)!;

  const [energyProduced, setEnergyProduced] = useState<number | null>(null);
  const [consumptionData, setConsumptionData] = useState<ConsumptionDataPoint[]>([]);
  const [vlnValue, setVlnValue] = useState<number | null>(null);
  const [timestamp, setTimestamp] = useState<string | null>(null);
  const [runtime, setRuntime] = useState<number | null>(null);
  const [status, setStatus] = useState("Off");
  const [currentValue, setCurrentValue] = useState<number | null>(null);
  const [alertsData, setAlertsData] = useState<AlertData[]>([]);

  const backendDGNo = id === "1" ? 13 : id === "2" ? 14 : null;

  useEffect(() => {
    const fetchDGData = async () => {
      try {
        const response = await fetch(
          `${import.meta.env.VITE_API_BASE_URL}/api/dgdtest?startDateTime=${startDateTime}&endDateTime=${endDateTime}&DGNo=${backendDGNo}`
        );
        const data = await response.json();

        if (data?.dgd?.energyProduced !== undefined) {
          setEnergyProduced(data.dgd.energyProduced);
        } else {
          setEnergyProduced(0);
        }

        const meterInfo = data.dgdcv?.[backendDGNo as any];
        if (meterInfo) {
          setVlnValue(meterInfo.avg_vln_value);
          setCurrentValue(meterInfo.avg_current_value);
          setTimestamp(meterInfo.timestamp);
        } else {
          setVlnValue(null);
          setTimestamp(null);
        }

        if (meterInfo?.timestamp) {
          const now = moment.tz("Asia/Kolkata");
          const last = moment.tz(meterInfo.timestamp, "Asia/Kolkata");
          const diffSeconds = now.diff(last, "seconds");

          setStatus(diffSeconds <= 180 ? "Running" : "Off");
        } else {
          setStatus("Off");
        }


        if (data?.dgdrt?.[backendDGNo as any]) {
          setRuntime(data.dgdrt[backendDGNo as any].runningTimeMinutes);
        } else {
          setRuntime(null);
        }

        const hourlyData = data?.hrly_kwh_diff?.[backendDGNo as any];
        if (hourlyData) {
          const formatted = Object.entries(hourlyData).map(([ts, kWh]) => ({
            y: kWh as number,
            originalTimestamp: ts,
          }));
          setConsumptionData(formatted);
        } else {
          setConsumptionData([]);
        }
      } catch (error) {
        console.error("Failed to fetch DG data:", error);
        setEnergyProduced(0);
        setConsumptionData([]);
      }
    };

    const fetchAlertsData = async () => {
      try {
        const response = await fetch(
          `${import.meta.env.VITE_API_BASE_URL}/api/apdtest?startDateTime=${startDateTime}&endDateTime=${endDateTime}`
        );
        const data = await response.json();

        if (data?.dgActivations) {
          // Filter alerts for the current DG only
          const filteredAlerts = data.dgActivations.filter(
            (alert: AlertData) => alert.meter === backendDGNo
          );
          setAlertsData(filteredAlerts);
        } else {
          setAlertsData([]);
        }
      } catch (error) {
        console.error("Failed to fetch alerts data:", error);
        setAlertsData([]);
      }
    };

    if (backendDGNo) {
      fetchDGData();
      fetchAlertsData();
    }
  }, [id, startDateTime, endDateTime, backendDGNo]);

  const chartOptions: ApexOptions = {
    chart: {
      type: "bar",
      background: "transparent",
      toolbar: { show: false },
    },
    grid: { show: false },
    xaxis: {
      categories: consumptionData.map((d) =>
        moment(d.originalTimestamp, "YYYY-MM-DD HH:mm:ss").format("HH:mm")
      ),
      title: {
        text: "Time",
      },
      labels: {
        style: { fontSize: "10px" },
      },
    },
    yaxis: {
      title: {
        text: "Energy Generated (kWh)",
      },
    },
    tooltip: {
      custom: ({ series, seriesIndex, dataPointIndex }: any) => {
        const point = consumptionData[dataPointIndex];
        const val = series[seriesIndex][dataPointIndex];
        return `
          <div style="padding:8px;background:#fff;border:1px solid #ccc;color:#000;">
            <b>Timestamp:</b> ${point?.originalTimestamp}<br/>
            <b>Energy Generated:</b> ${val} kWh
          </div>
        `;
      },
    },
  };

  const chartSeries = [
    {
      name: "Energy Generated",
      data: consumptionData.map((d) => d.y),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="p-6 bg-white mt-5 rounded-lg shadow-md mx-4">
        <div className="flex justify-center mb-6 space-x-4">
          <button
            className={`px-4 py-2 rounded-lg font-semibold border transition ${
              id === "1"
                ? "bg-blue-600 text-white border-green-600"
                : "bg-white text-gray-800 border-gray-300"
            }`}
            onClick={() => navigate("/monitor/generator/1")}
          >
            DG 1
          </button>
          <button
            className={`px-4 py-2 rounded-lg font-semibold border transition ${
              id === "2"
                ? "bg-blue-600 text-white border-green-600"
                : "bg-white text-gray-800 border-gray-300"
            }`}
            onClick={() => navigate("/monitor/generator/2")}
          >
            DG 2
          </button>
        </div>

        <div className="flex flex-col lg:flex-row gap-6">
          <div className="lg:w-1/3 p-6 lg:border-r lg:border-gray-300">
            <div className="relative group w-fit mx-auto mb-4">
              <img
                className="w-50 h-40 object-contain rounded-lg"
                src={dg}
                alt="DG"
              />
              <p className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity bg-gray-900 bg-opacity-90 text-white text-sm py-2 px-4 rounded-lg shadow-lg z-10 pointer-events-none whitespace-nowrap">
                Section Not Available
              </p>
            </div>

            <div className="text-lg text-gray-700 space-y-2">
              <p>
                <strong>Status:</strong>{" "}
                <span
                  className={
                    status === "Running" ? "text-green-600" : "text-red-600"
                  }
                >
                  {status}
                </span>
              </p>
              <p>
                <strong>Energy Generation:</strong>{" "}
                {energyProduced !== null ? `${energyProduced} kWh` : "N/A"}
              </p>
              <p>
                <strong>Voltage:</strong>{" "}
                {vlnValue !== null ? `${vlnValue} V` : "N/A"}
              </p>
              <p>
                <strong>Current:</strong>{" "}
                {currentValue !== null ? `${currentValue} A` : "N/A"}
              </p>
              <p>
                <strong>Total Runtime:</strong>{" "}
                {runtime !== null ? `${runtime} minutes` : "N/A"}
              </p>
              <p>
                <strong>Last Updated:</strong> {timestamp || "N/A"}
              </p>
            </div>
          </div>

          <div className="lg:w-2/3">
            <h2 className="text-2xl font-bold text-center pb-4 pt-5 mb-4">
              Energy Generation
            </h2>
            <div className="flex justify-center">
              <Chart options={chartOptions} series={chartSeries} type="bar" height={400} />
            </div>
          </div>
        </div>
      </div>

      {/* Alerts History Card */}
      <div className="p-6 bg-white rounded-lg shadow-md mx-4">
        <h2 className="text-2xl font-bold text-center mb-6">DG {id} Alerts History</h2>

        {alertsData.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full table-auto border-collapse text-center">
              <thead>
                <tr className="bg-gray-100 text-center">
                  <th className="border border-gray-300 px-4 py-2 ">Timestamp</th>
                  <th className="border border-gray-300 px-4 py-2 ">Status</th>
                  <th className="border border-gray-300 px-4 py-2 ">kWh Reading</th>
                  <th className="border border-gray-300 px-4 py-2 ">Details</th>
                </tr>
              </thead>
              <tbody>
                {alertsData.map((alert, index) => (
                  <tr key={index} className="hover:bg-gray-50">
                    <td className="border border-gray-300 px-4 py-2">
                      {moment(alert.timestamp).format('DD/MM/YYYY HH:mm:ss')}
                    </td>
                    <td className="border border-gray-300 px-4 py-2">
                      <span
                        className={`px-2 py-1 rounded text-sm font-medium ${
                          alert.status === "DG started"
                            ? "bg-green-100 text-green-800"
                            : "bg-red-100 text-red-800"
                        }`}
                      >
                        {alert.status}
                      </span>
                    </td>
                    <td className="border border-gray-300 px-4 py-2">
                      {alert.kWh} kWh
                    </td>
                    <td className="border border-gray-300 px-4 py-2">
                      {alert.status === "DG stopped" && alert.startTime ? (
                        <div className="text-sm text-gray-600">
                          <div>Started: {moment(alert.startTime).format('DD/MM/YYYY HH:mm:ss')}</div>
                          <div>Start kWh: {alert.startKWh} kWh</div>
                          <div>Units Generated: {(alert.kWh - alert.startKWh!).toFixed(1)} kWh</div>
                          <div>Duration: {moment(alert.timestamp).diff(moment(alert.startTime), 'minutes')} min</div>
                        </div>
                      ) : (
                        <span className="text-gray-500">-</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-8 text-gray-500">
            <div className="text-lg mb-2">No alerts found</div>
            <div className="text-sm">No DG activation/deactivation events in the selected time range</div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Dgd;
