const { Sequelize } = require('sequelize');
require('dotenv').config();

// Log database connection details (without sensitive info)
console.log('Database connection details:', {
  host: process.env.DATABASE_URL ? new URL(process.env.DATABASE_URL).hostname : 'not set',
  database: process.env.DATABASE_URL ? new URL(process.env.DATABASE_URL).pathname.slice(1) : 'not set',
  ssl: true
});

const sequelize = new Sequelize(process.env.DATABASE_URL, {
  dialect: 'postgres',
  protocol: 'postgres',
  dialectOptions: {
    ssl: {
      require: true,
      rejectUnauthorized: false
    }
  },
  pool: {
    max: 5,
    min: 0,
    acquire: 30000,
    idle: 10000
  },
  logging: (msg) => console.log('Database Query:', msg),
  retry: {
    max: 3,
    match: [/Deadlock/i, /Connection lost/i]
  }
});

// Test the connection
sequelize.authenticate()
  .then(() => {
    console.log('✅ Database connection has been established successfully.');
  })
  .catch(err => {
    console.error('❌ Unable to connect to the database:', err);
  });

module.exports = { sequelize };
