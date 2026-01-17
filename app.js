const express = require('express');
const { execFile } = require('child_process');
const app = express();
const path = require('path');
const port = 3000;

app.use(express.static(path.join(__dirname, 'assets')));

app.engine('.ejs', require('ejs').__express);

app.set('views', path.join(__dirname, 'views'));

app.set('view engine', 'ejs');

let app_config = {
  'project': 'Water Quality Forecast',
  'author': 'Mohamed Yaseen & Team'
};

const tamil_nadu_districts = [
  "Ariyalur", "Chengalpattu", "Chennai", "Coimbatore", "Cuddalore", "Dharmapuri", "Dindigul",
  "Erode", "Kallakurichi", "Kancheepuram", "Karur", "Krishnagiri", "Madurai", "Mayiladuthurai",
  "Nagapattinam", "Namakkal", "Nilgiris", "Perambalur", "Pudukkottai", "Ramanathapuram",
  "Ranipet", "Salem", "Sivaganga", "Tenkasi", "Thanjavur", "Theni", "Thoothukudi", "Tiruchirappalli",
  "Tirunelveli", "Tirupathur", "Tiruppur", "Tiruvallur", "Tiruvannamalai", "Tiruvarur",
  "Vellore", "Viluppuram", "Virudhunagar"
];

// Home page
app.get('/', function (req, res) {
  app_config['districts'] = tamil_nadu_districts;
  res.render('app', app_config);
});

// Analytics page
app.get('/analytics', function (req, res) {
  res.render('analytics', app_config);
});

// About page
app.get('/about', function (req, res) {
  res.render('about', app_config);
});

app.get('/forecast', (req, res) => {
  const { district, start, end, precip, temp } = req.query; // precip = factor (e.g. 1.2), temp = bias (e.g. 2.0)
  if (!district || !start || !end) {
    return res.status(400).send("Missing parameters");
  }

  // Call Ensemble Model with Simulation Params
  const args = ['ensemble_model.py', '--district', district, '--start', start, '--end', end];
  if (precip) args.push('--precip_factor', precip);
  if (temp) args.push('--temp_bias', temp);

  console.log('Executing Forecast:', args);

  execFile('./venv/bin/python', args, { maxBuffer: 1024 * 1024 * 10 }, (error, stdout, stderr) => {
    if (error) {
      console.error('Error executing Python script:', error);
      console.error('stderr:', stderr);
      return res.status(500).json({
        error: 'Error generating forecast',
        details: stderr || error.message
      });
    }
    try {
      const result = JSON.parse(stdout);
      if (result.error) {
        return res.status(400).json(result);
      }
      res.json(result);
    } catch (parseError) {
      console.error('Error parsing Python script output:', parseError);
      res.status(500).json({
        error: 'Error parsing forecast data',
        details: parseError.message
      });
    }
  });
});

app.get('/api/analytics', (req, res) => {
  execFile('./venv/bin/python', ['get_analytics.py'], (error, stdout, stderr) => {
    if (error) {
      console.error('Error executing Analytics script:', error);
      return res.status(500).json({ error: 'Failed to generate analytics' });
    }
    try {
      const data = JSON.parse(stdout);
      res.json(data);
    } catch (e) {
      res.status(500).json({ error: 'Invalid JSON from analytics script' });
    }
  });
});

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
