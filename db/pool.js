const { Pool } = require("pg");
require("dotenv").config();

const DB_HOST = process.env.DB_HOST;
const DB_USER = process.env.DB_USER;
const DB_NAME = process.env.DB_NAME;
const DB_PASSW = process.env.DB_PASSW;
const DB_PORT = process.env.DB_PORT;

module.exports = new Pool({
  host: DB_HOST,
  user: DB_USER,
  database: DB_NAME,
  password: DB_PASSW,
  port: DB_PORT,
});
