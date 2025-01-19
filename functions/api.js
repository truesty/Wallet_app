const express = require('express');
const serverless = require('serverless-http');
const cors = require('cors');
const bodyParser = require('body-parser');

const app = express();

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Your API routes go here
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok' });
});

// Export the handler
module.exports.handler = serverless(app);