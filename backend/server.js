const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const path = require('path');
const fs = require('fs');

const reportsDir = path.join(__dirname, 'monthly_reports');
const energyRoute = require('./hconsumption');
const energytestRoute = require('./hconsumptiontest');
const meterRoutes = require('./econsumption');
const ehConsumptionRoutes = require('./ehconsumption');
const zConsumptionRoute = require('./zconsumption');
const zConsumptionRoutetest = require('./zconsumptiontest');
const oPeakDemandRoutes = require('./opeakdemand');
const mbConsumptionRoutes = require('./mbconsumption');
const mcconspeakRoutes = require('./mcconspeak');
const ConsumptionRoutes = require('./consumption');
const mcconsRoutes = require('./mccons');
const mcapconsRoutes = require('./mcapcons');
const hlconsRoutes = require('./hlcons');
const mcpeakRoutes = require('./mcpeak');
const pfRoutes = require('./pf');
const hkVAhRoute = require('./hkVAhconsumption');
const hkVAhconsumptiontestRoute = require('./hkVAhconsumptiontest');
const zkVAhConsumptionRoute = require('./zkVAhconsumption');
const zkVAhConsumptiontestRoute = require('./zkVAhconsumptiontest');
const ccRoutes = require('./cc');
const apdRoutes = require('./apd');
const apdtestRoute = require('./apdtest');
const hcostconsumptionRoute = require('./hcostconsumption');
const hcostconsumptiontestRoute = require('./hcostconsumptiontest');
const authRoute = require('./auth');
const logoutRoute = require('./logout')
const heartBeatRoute = require('./heartbeat');
const filesRoute = require('./fileF');
const mrRoute = require('./meterreading');
const mrtestRoute = require('./meterreadingtest');
const zkVARoute = require('./zkVA');
const zkVARoutetest = require('./zkVAtest');
const zkVAazRoute = require('./zkVAaz');
const zkVAazRoutetest = require('./zkVAaztest');
const dgdcRoute = require('./dgdc');
const dgdRoute = require('./dgd');
const dgdRoutetest = require('./dgdtest');
const dgdcvRoute = require('./dgdcv');
const dgdrtRoute = require('./dgdrt');
const dgdkWhdiffRoute = require('./dgdkWhdiff');
const zkVAhAZconsumption = require('./zkVAhAZconsumption');
const zkVAhAZconsumptiontest = require('./zkVAhAZconsumptiontest');
const zkWhAZconsumption = require('./zkWhAZconsumption');
const zkWhAZconsumptiontest = require('./zkWhAZconsumptiontest');
const dashboardpt1Route = require('./dashboardpt1');
const dashboardpt1testRoute = require('./dashboardpt1test');
const dashboardpt2Route = require('./dashboardpt2');
const dashboardpt2testRoute = require('./dashboardpt2test');
const opeakdemandmbRoute = require('./opeakdemandmb');
const zkVAazmbRoute = require('./zkVAazmb');
const ehconsumptiontestRoute = require('./ehconsumptiontest');
const app = express();
const port = 3001;

const baseFolderPath = '/Users/jonathanprince/Documents/Work/filesTest';

app.use('/reports', express.static(path.join(__dirname, 'monthly_reports')));
app.use('/uploads', express.static(baseFolderPath));

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

app.use('/api', energyRoute);
app.use('/api', energytestRoute);
app.use('/api', meterRoutes);
app.use('/api', ehConsumptionRoutes);
app.use('/api', ehconsumptiontestRoute);
app.use('/api', zConsumptionRoute);
app.use('/api', zConsumptionRoutetest);
app.use('/api', oPeakDemandRoutes);
app.use('/api', mbConsumptionRoutes);
app.use('/api', mcconspeakRoutes);
app.use('/api', ConsumptionRoutes);
app.use('/api', mcconsRoutes);
app.use('/api', hlconsRoutes);
app.use('/api', mcpeakRoutes);
app.use('/api', pfRoutes);
app.use('/api', hkVAhRoute);
app.use('/api', hkVAhconsumptiontestRoute);
app.use('/api', zkVAhConsumptionRoute);
app.use('/api', zkVAhConsumptiontestRoute);
app.use('/api', ccRoutes);
app.use('/api', apdRoutes);
app.use('/api', apdtestRoute);
app.use('/api', hcostconsumptionRoute);
app.use('/api', hcostconsumptiontestRoute);
app.use('/api', mcapconsRoutes);
app.use('/api', authRoute);
app.use('/api', logoutRoute);
app.use('/api', heartBeatRoute);
app.use('/api', filesRoute);
app.use('/api', mrRoute);
app.use('/api', mrtestRoute);
app.use('/api', zkVARoute);
app.use('/api', zkVARoutetest);
app.use('/api', zkVARoutetest);
app.use('/api', zkVAazRoute);
app.use('/api', zkVAazRoutetest);
app.use('/api', dgdcRoute);
app.use('/api', dgdRoute);
app.use('/api', dgdRoutetest);
app.use('/api', dgdcvRoute);
app.use('/api', dgdrtRoute);
app.use('/api', dgdkWhdiffRoute);
app.use('/api', zkVAhAZconsumption);
app.use('/api', zkVAhAZconsumptiontest);
app.use('/api', zkWhAZconsumption);
app.use('/api', zkWhAZconsumptiontest);
app.use('/api', dashboardpt1Route);
app.use('/api', dashboardpt1testRoute);
app.use('/api', dashboardpt2Route);
app.use('/api', dashboardpt2testRoute);
app.use('/api', opeakdemandmbRoute);
app.use('/api', zkVAazmbRoute);

app.get('/api/list-reports', (req, res) => {
  fs.readdir(reportsDir, (err, files) => {
    if (err) {
      console.error('Error reading monthly_reports:', err);
      return res.status(500).json({ error: 'Unable to fetch reports.' });
    }

    const excelFiles = files.filter(file => file.endsWith('.xlsx'));
    res.json(excelFiles);
  });
});

app.get('/api/download-report/:filename', (req, res) => {
  const file = path.join(reportsDir, req.params.filename);
  
  // Set correct headers
  res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
  res.setHeader('Content-Disposition', `attachment; filename=${req.params.filename}`);
  
  // Stream the file
  const fileStream = fs.createReadStream(file);
  fileStream.pipe(res);
  
  fileStream.on('error', (err) => {
    console.error('Error streaming file:', err);
    res.status(500).send('Error downloading file');
  });
});

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send('Something broke!');
});

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});











