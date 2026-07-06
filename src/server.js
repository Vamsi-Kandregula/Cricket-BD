const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });
const app = require('./app');

const PORT = process.env.PORT || 5000;

const server = app.listen(PORT, () => {
  console.log(`=========================================`);
  console.log(`Cricket SaaS Analytics Backend running!`);
  console.log(`Uptime check: http://localhost:${PORT}/health`);
  console.log(`Swagger Docs: http://localhost:${PORT}/api-docs`);
  console.log(`Port binding: ${PORT}`);
  console.log(`Environment:  ${process.env.NODE_ENV || 'development'}`);
  console.log(`=========================================`);
});

// Graceful teardown listeners for production deployments
process.on('SIGTERM', () => {
  console.log('SIGTERM signal received. Shutting down gracefully...');
  server.close(() => {
    console.log('HTTP server closed.');
    process.exit(0);
  });
});

process.on('SIGINT', () => {
  console.log('SIGINT signal received. Shutting down gracefully...');
  server.close(() => {
    console.log('HTTP server closed.');
    process.exit(0);
  });
});
