const snowflake = require('snowflake-sdk');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../../.env') });

// Construct the connection parameters from environment variables.
// Prioritizes SNOWFLAKE_ prefixed variables to avoid clashes with Windows built-in variables (like USERNAME).
const connectionOptions = {
  account: process.env.SNOWFLAKE_ACCOUNT || process.env.ACCOUNT,
  username: process.env.SNOWFLAKE_USERNAME || process.env.USERNAME,
  password: process.env.SNOWFLAKE_PASSWORD || process.env.PASSWORD,
  warehouse: process.env.SNOWFLAKE_WAREHOUSE || process.env.WAREHOUSE,
  database: process.env.SNOWFLAKE_DATABASE || process.env.DATABASE,
  schema: process.env.SNOWFLAKE_SCHEMA || process.env.SCHEMA,
  role: process.env.SNOWFLAKE_ROLE || process.env.ROLE
};

/**
 * Reusable execution helper that connects, runs a query, and ensures connection destruction.
 * @param {string} sqlText - SQL statement to execute
 * @param {Array} binds - Bind parameters for the SQL query
 * @returns {Promise<Array>} - Resolves with rows returned by Snowflake
 */
const executeQuery = (sqlText, binds = []) => {
  return new Promise((resolve, reject) => {
    const connection = snowflake.createConnection(connectionOptions);

    connection.connect((err, conn) => {
      if (err) {
        console.error('Failed to establish connection to Snowflake:', err);
        return reject(err);
      }

      conn.execute({
        sqlText,
        binds,
        complete: (executeErr, stmt, rows) => {
          // Guarantee connection teardown to prevent connection leaks
          connection.destroy((destroyErr) => {
            if (destroyErr) {
              console.error('Error closing Snowflake connection:', destroyErr);
            }
          });

          if (executeErr) {
            console.error('Snowflake query execution failed:', executeErr);
            return reject(executeErr);
          }

          resolve(rows);
        }
      });
    });
  });
};

/**
 * Validates connection settings for the health endpoint.
 * @returns {Promise<{connected: boolean, error?: string}>}
 */
const testConnection = () => {
  return new Promise((resolve) => {
    const connection = snowflake.createConnection(connectionOptions);

    connection.connect((err, conn) => {
      if (err) {
        resolve({ connected: false, error: err.message });
      } else {
        connection.destroy((destroyErr) => {
          if (destroyErr) {
            console.error('Error closing Snowflake connection in test:', destroyErr);
          }
        });
        resolve({ connected: true });
      }
    });
  });
};

module.exports = {
  executeQuery,
  testConnection,
  connectionOptions
};
