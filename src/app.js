const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const path = require('path');
const swaggerUi = require('swagger-ui-express');
const YAML = require('yamljs');
const { testConnection } = require('./config/snowflake');
const dashboardRoutes = require('./routes/dashboard.routes');

const app = express();

// Load OpenAPI Swagger specs
const swaggerDocument = YAML.load(path.join(__dirname, 'config/swagger.yaml'));

// Setup global middleware
app.use(helmet());
app.use(cors());
app.use(express.json());

// API Swagger Docs Endpoint
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

// Health diagnostic endpoint
app.get('/health', async (req, res) => {
  const dbHealth = await testConnection();

  const status = {
    status: 'UP',
    snowflake: dbHealth.connected ? 'CONNECTED' : 'DISCONNECTED'
  };

  // If Snowflake connection fails, return 503 Service Unavailable, otherwise 200 OK
  if (!dbHealth.connected) {
    return res.status(503).json({
      ...status,
      error: dbHealth.error
    });
  }

  return res.status(200).json(status);
});

// Mount modular API routers
app.use('/api', dashboardRoutes);

// Fallback 404 handler
app.use((req, res, next) => {
  res.status(404).json({
    status: 'NOT_FOUND',
    message: `Endpoint ${req.method} ${req.originalUrl} not found`
  });
});

// Centralized error handling
app.use((err, req, res, next) => {
  console.error('Unhandled Application Error:', err);
  res.status(err.status || 500).json({
    status: 'ERROR',
    message: err.message || 'An internal server error occurred.'
  });
});

module.exports = app;
