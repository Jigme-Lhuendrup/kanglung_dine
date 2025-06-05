const { Sequelize } = require('sequelize');
require('dotenv').config(); // Ensure .env variables are loaded

// Define configurations for each environment
const development = {
  username: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME || 'KanglungDine_db',
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT, 10) || 5432,
  dialect: 'postgres',
  schema: 'public',
  logging: false,
  pool: {
    max: 5,
    min: 0,
    acquire: 30000,
    idle: 10000
  },
  define: {
    timestamps: true,
    underscored: false,
    freezeTableName: true
  },
  dialectOptions: {
    // ssl: { require: true, rejectUnauthorized: false } // Example for SSL
  }
};

const test = {
  username: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME_TEST || 'KanglungDine_db_test',
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT, 10) || 5432,
  dialect: 'postgres',
  schema: 'public',
  logging: false,
  pool: {
    max: 5,
    min: 0,
    acquire: 30000,
    idle: 10000
  },
  define: {
    timestamps: true,
    underscored: false,
    freezeTableName: true
  }
  // dialectOptions can be added if needed for test environment
};

const production = {
  use_env_variable: 'DATABASE_URL',
  dialect: 'postgres',
  schema: 'public',
  logging: false,
  pool: {
    max: 5,
    min: 0,
    acquire: 30000,
    idle: 10000
  },
  define: {
    timestamps: true,
    underscored: false,
    freezeTableName: true
  },
  dialectOptions: {
    ssl: {
      require: true,
      rejectUnauthorized: false
    }
  }
};

// Determine current environment and select config
const env = process.env.NODE_ENV || 'development';
let currentEnvConfig;

switch (env) {
  case 'production':
    currentEnvConfig = production;
    break;
  case 'test':
    currentEnvConfig = test;
    break;
  default: // 'development' or any other unspecified environment
    currentEnvConfig = development;
}

if (!currentEnvConfig) {
  throw new Error(`Configuration for environment "${env}" not found.`);
}

// Create Sequelize instance
const sequelize = new Sequelize(
  currentEnvConfig.database,
  currentEnvConfig.username,
  currentEnvConfig.password,
  currentEnvConfig // Pass the whole config object for dialect, pool, define, logging etc.
);

// Test database connection (optional, can be removed if handled elsewhere e.g. app startup)
sequelize.authenticate()
  .then(() => {
    if (env === 'development') { // Log connection success only in development
      console.log('Database connected successfully via unified config.js.');
    }
  })
  .catch(err => {
    console.error('Unable to connect to the database via unified config.js:', err);
  });

// Export for both Sequelize CLI and application use
module.exports = {
  development,  // For Sequelize CLI
  test,         // For Sequelize CLI
  production,   // For Sequelize CLI
  sequelize,    // The instantiated sequelize object for the application
  Sequelize     // The Sequelize class itself, if needed by the application
};