import Chart from 'react-apexcharts';
import { ApexOptions } from 'apexcharts';

const RenewableEnergy = () => {
  // Wheeled in Solar Phase 1 - Daily Solar Data chart options
  const solarDailyDataOptions: ApexOptions = {
    title: {
      text: 'Wheeled in Solar Phase 1 - Daily Solar Data',
    },
    chart: {
      type: 'line',
    },
    xaxis: {
      categories: ['1st', '2nd', '3rd', '4th', '5th', '6th', '7th', '8th', '9th', '10th'],
      title: {
        text: 'Days of the Month',
      },
    },
    yaxis: {
      title: {
        text: 'Solar Energy (kWh)',
      },
    },
    colors: ['#F59E0B'], // Solar Yellow
    tooltip: {
      y: {
        formatter: (val: number) => `${val} kWh`,
      },
    },
  };

  const solarDailyDataSeries = [
    {
      name: 'Daily Solar Energy',
      data: [12, 15, 14, 13, 18, 20, 22, 25, 23, 24],
    },
  ];

  // Inverter Active Power chart options
  const inverterPowerOptions: ApexOptions = {
    title: {
      text: 'Inverter Active Power (kW)',
    },
    chart: {
      type: 'area',
    },
    xaxis: {
      categories: ['9 AM', '10 AM', '11 AM', '12 PM', '1 PM', '2 PM', '3 PM', '4 PM'],
      title: {
        text: 'Time of Day',
      },
    },
    yaxis: {
      title: {
        text: 'Power (kW)',
      },
    },
    colors: ['#34D399'], // Green
    tooltip: {
      y: {
        formatter: (val: number) => `${val} kW`,
      },
    },
    fill: {
      opacity: 0.5,
    },
  };

  const inverterPowerSeries = [
    {
      name: 'Inverter Power',
      data: [1.2, 1.5, 2.0, 2.4, 2.5, 2.3, 2.1, 1.8],
    },
  ];

  // Expected vs Actual Solar Generation chart options
  const expectedVsActualOptions: ApexOptions = {
    title: {
      text: 'Expected vs Actual Solar Generation (kWh)',
    },
    chart: {
      type: 'bar',
    },
    xaxis: {
      categories: ['1st', '2nd', '3rd', '4th', '5th', '6th', '7th', '8th', '9th', '10th'],
      title: {
        text: 'Days of the Month',
      },
    },
    yaxis: {
      min: 0,
      title: {
        text: 'Energy (kWh)',
      },
    },
    colors: ['#60A5FA', '#EF4444'], // Blue, Red
    tooltip: {
      shared: true,
      y: {
        formatter: (val: number) => `${val} kWh`,
      },
    },
    plotOptions: {
      bar: {
        columnWidth: '80%',
      },
    },
  };

  const expectedVsActualSeries = [
    {
      name: 'Expected Generation',
      data: [20, 22, 25, 24, 23, 26, 27, 28, 25, 24],
    },
    {
      name: 'Actual Generation',
      data: [18, 20, 22, 23, 21, 25, 26, 24, 23, 22],
    },
  ];

  // Rooftop Solar chart options
  const rooftopSolarOptions: ApexOptions = {
    title: {
      text: 'Rooftop Solar Energy (kWh)',
    },
    chart: {
      type: 'line',
    },
    xaxis: {
      categories: ['1st', '2nd', '3rd', '4th', '5th', '6th', '7th', '8th', '9th', '10th'],
      title: {
        text: 'Days of the Month',
      },
    },
    yaxis: {
      title: {
        text: 'Energy (kWh)',
      },
    },
    colors: ['#F97316'], // Orange
    tooltip: {
      y: {
        formatter: (val: number) => `${val} kWh`,
      },
    },
  };

  const rooftopSolarSeries = [
    {
      name: 'Rooftop Solar',
      data: [15, 17, 19, 22, 25, 27, 28, 30, 29, 26],
    },
  ];

  // Phase Wise Generation chart options
  const phaseWiseGenerationOptions: ApexOptions = {
    title: {
      text: 'Phase Wise Generation (kWh)',
    },
    chart: {
      type: 'bar',
    },
    xaxis: {
      categories: ['Phase 1', 'Phase 2', 'Phase 3', 'Phase 4'],
      title: {
        text: 'Phases',
      },
    },
    yaxis: {
      title: {
        text: 'Generation (kWh)',
      },
    },
    colors: ['#22D3EE'], // Cyan
    tooltip: {
      y: {
        formatter: (val: number) => `${val} kWh`,
      },
    },
    plotOptions: {
      bar: {
        horizontal: true,
      },
    },
  };

  const phaseWiseGenerationSeries = [
    {
      name: 'Generation',
      data: [300, 500, 450, 600],
    },
  ];

  // Expected vs Actual Generation for different phases
  const expectedVsActualPhaseWiseOptions: ApexOptions = {
    title: {
      text: 'Expected vs Actual Generation (kWh) - Phases',
    },
    chart: {
      type: 'bar',
    },
    xaxis: {
      categories: ['Phase 1', 'Phase 2', 'Phase 3', 'Phase 4'],
      title: {
        text: 'Phases',
      },
    },
    yaxis: {
      min: 0,
      title: {
        text: 'Energy (kWh)',
      },
    },
    colors: ['#60A5FA', '#EF4444'], // Blue, Red
    tooltip: {
      shared: true,
      y: {
        formatter: (val: number) => `${val} kWh`,
      },
    },
    plotOptions: {
      bar: {
        columnWidth: '80%',
      },
    },
  };

  const expectedVsActualPhaseWiseSeries = [
    {
      name: 'Expected Generation',
      data: [400, 600, 550, 650],
    },
    {
      name: 'Actual Generation',
      data: [300, 500, 450, 600],
    },
  ];

  // Active Power chart options
  const activePowerOptions: ApexOptions = {
    title: {
      text: 'Active Power (kW)',
    },
    chart: {
      type: 'line',
    },
    xaxis: {
      categories: ['9 AM', '10 AM', '11 AM', '12 PM', '1 PM', '2 PM', '3 PM', '4 PM'],
      title: {
        text: 'Time of Day',
      },
    },
    yaxis: {
      title: {
        text: 'Power (kW)',
      },
    },
    colors: ['#4F46E5'], // Indigo
    tooltip: {
      y: {
        formatter: (val: number) => `${val} kW`,
      },
    },
  };

  const activePowerSeries = [
    {
      name: 'Active Power',
      data: [2.1, 2.3, 2.5, 2.7, 2.9, 3.0, 2.8, 2.6],
    },
  ];

  // Wind Speed chart options
  const windSpeedOptions: ApexOptions = {
    title: {
      text: 'Wind Speed (m/s)',
    },
    chart: {
      type: 'line',
    },
    xaxis: {
      categories: ['9 AM', '10 AM', '11 AM', '12 PM', '1 PM', '2 PM', '3 PM', '4 PM'],
      title: {
        text: 'Time of Day',
      },
    },
    yaxis: {
      title: {
        text: 'Wind Speed (m/s)',
      },
    },
    colors: ['#D97706'], // Amber
    tooltip: {
      y: {
        formatter: (val: number) => `${val} m/s`,
      },
    },
  };

  const windSpeedSeries = [
    {
      name: 'Wind Speed',
      data: [3.2, 4.1, 5.5, 6.2, 5.8, 6.0, 5.5, 4.9],
    },
  ];

  return (
    <div style={{ padding: '20px' }}>
          {/* Page Title */}
          <div className="mb-8 text-center">
            <h1 className="text-4xl font-bold text-gray-800">Renewable Energy Overview</h1>
            <p className="text-gray-600 mt-2">Monitor various aspects of renewable energy data</p>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '20px', marginTop: '20px' }}>
            <div style={{ flex: '1 1 30%', border: '1px solid #ccc', borderRadius: '5px', padding: '10px' }}>
              <h4>Active Power Summary</h4>
              <p>Total Active Power: <strong>10 kW</strong></p>
            </div>
            <div style={{ flex: '1 1 30%', border: '1px solid #ccc', borderRadius: '5px', padding: '10px' }}>
              <h4>Wind Speed Summary</h4>
              <p>Average Wind Speed: <strong>4.5 m/s</strong></p>
            </div>
            <div style={{ flex: '1 1 30%', border: '1px solid #ccc', borderRadius: '5px', padding: '10px' }}>
              <h4>Energy Generation Summary</h4>
              <p>Total Solar Generation: <strong>300 kWh</strong></p>
            </div>
          </div>
          </div>
      <div style={{ marginBottom: '20px' }}>
        <Chart options={solarDailyDataOptions} series={solarDailyDataSeries} type="line" height={350} />
      </div>
      <div style={{ marginBottom: '20px' }}>
        <Chart options={inverterPowerOptions} series={inverterPowerSeries} type="area" height={350} />
      </div>
      <div style={{ marginBottom: '20px' }}>
        <Chart options={expectedVsActualOptions} series={expectedVsActualSeries} type="bar" height={350} />
      </div>
      <div style={{ marginBottom: '20px' }}>
        <Chart options={rooftopSolarOptions} series={rooftopSolarSeries} type="line" height={350} />
      </div>
      <div style={{ marginBottom: '20px' }}>
        <Chart options={phaseWiseGenerationOptions} series={phaseWiseGenerationSeries} type="bar" height={350} />
      </div>
      <div style={{ marginBottom: '20px' }}>
        <Chart options={expectedVsActualPhaseWiseOptions} series={expectedVsActualPhaseWiseSeries} type="bar" height={350} />
      </div>
      <div style={{ marginBottom: '20px' }}>
        <Chart options={activePowerOptions} series={activePowerSeries} type="line" height={350} />
      </div>
      <div style={{ marginBottom: '20px' }}>
        <Chart options={windSpeedOptions} series={windSpeedSeries} type="line" height={350} />
      </div>
      </div>
  );
};

export default RenewableEnergy;
