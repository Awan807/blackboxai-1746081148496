require('dotenv').config();
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const { Pool } = require('pg');

const app = express();
const port = process.env.PORT || 5000;

app.use(cors());
app.use(bodyParser.json());

// PostgreSQL pool setup
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

// Test DB connection
pool.connect((err, client, release) => {
  if (err) {
    return console.error('Error acquiring client', err.stack);
  }
  console.log('Connected to PostgreSQL database');
  release();
});

// Basic route
app.get('/', (req, res) => {
  res.send('Student Attendance Backend is running');
});

// Import routes
const webauthnRouter = require('./routes/webauthn');

app.use('/webauthn', webauthnRouter);

// TODO: Add routes for attendance, reports

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});

module.exports = { app, pool };
