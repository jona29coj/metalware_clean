interface OverviewCardProps {
  charge: number | string;
  status: string;
  voltage: number | string;
  batteryTemp: number | string;
  energyUsed: number | string;
  operatingTime: number | string;
  totalCycles: number | string;
  lastMaintenance: string;
}

const OverviewCard = ({ charge, status, voltage, batteryTemp, energyUsed, operatingTime, totalCycles, lastMaintenance }: OverviewCardProps) => (
  <div className="bg-white shadow rounded-lg p-6">
    <h2 className="text-xl font-semibold mb-4 text-center">Overview</h2>
    <div className="grid grid-cols-2 gap-4">
      <div className="p-4 rounded-md shadow-sm">
        <h3 className="font-semibold">Battery Charge</h3>
        <div className="mt-2 text-3xl font-bold">{charge}%</div>
      </div>
      <div className="p-4 rounded-md shadow-sm">
        <h3 className="font-semibold">Current Status</h3>
        <div className="mt-2 text-2xl font-bold">{status}</div>
      </div>
      <div className="p-4 rounded-md shadow-sm">
        <h3 className="font-semibold">Battery Voltage</h3>
        <span className="text-3xl font-bold">{voltage} V</span>
      </div>
      <div className="p-4 rounded-md shadow-sm">
        <h3 className="font-semibold">Battery Temperature</h3>
        <span className="text-3xl font-bold">{batteryTemp}°C</span>
      </div>
      <div className="p-4 rounded-md shadow-sm">
        <h3 className="font-semibold">Total Energy Used</h3>
        <span className="text-3xl font-bold">{energyUsed} kWh</span>
      </div>
      <div className="p-4 rounded-md shadow-sm">
        <h3 className="font-semibold">Operating Time</h3>
        <span className="text-3xl font-bold">{operatingTime} hrs</span>
      </div>
      <div className="p-4 rounded-md shadow-sm">
        <h3 className="font-semibold">Total Cycles</h3>
        <span className="text-3xl font-bold">{totalCycles}</span>
      </div>
      <div className="p-4 rounded-md shadow-sm">
        <h3 className="font-semibold">Last Maintenance</h3>
        <span className="text-3xl font-bold">{lastMaintenance}</span>
      </div>
    </div>
  </div>
);

export default OverviewCard;
