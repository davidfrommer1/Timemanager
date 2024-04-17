
import { Client } from 'pg';

const client = new Client({
  user: 'admin',
  host: 'localhost',
  database: 'timemanager',
  password: 'wifhm',
  port: 5432
});

async function createScheme() {
  await client.connect();
  await client.query('DROP TABLE IF EXISTS users, appointments, workingtime, holidays, recordtrips');
  await client.query(`CREATE TABLE users(
    id VARCHAR(40) PRIMARY KEY,
    "createdAt" bigint NOT NULL,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(100) NOT NULL,
    password VARCHAR(255))`);
  await client.query(`CREATE TABLE appointments(
      id VARCHAR(40) PRIMARY KEY,
      "createdAt" bigint NOT NULL,
      title VARCHAR(100) NOT NULL,
      description VARCHAR(400),
      date VARCHAR(10),
      userId VARCHAR(40))`);
  await client.query(`CREATE TABLE holidays(
        id VARCHAR(40) PRIMARY KEY,
        "createdAt" bigint NOT NULL,
        "userId" VARCHAR(40),
        "title" VARCHAR(100) NOT NULL,
        "fromdate" VARCHAR(10) NOT NULL,
        "todate" VARCHAR(10) NOT NULL,
        )`);
  await client.query(`CREATE TABLE recordtrips(
          id VARCHAR(40) PRIMARY KEY,
          "createdAt" bigint NOT NULL,
          "userId" VARCHAR(40),
          "fromdate" VARCHAR(10) NOT NULL,
          "todate" VARCHAR(10) NOT NULL,
          "hours" VARCHAR(10) NOT NULL,
          "destination" VARCHAR(100) NOT NULL,
          "customer" VARCHAR(100) NOT NULL,
          "note" VARCHAR (300),
          )`);
  await client.query(`CREATE TABLE workingtime(
      id VARCHAR(40) PRIMARY KEY,
      "date" VARCHAR(20) NOT NULL,
      "start" VARCHAR(20) NOT NULL,
      "end" VARCHAR(20) NOT NULL,
      "duration" VARCHAR(10) NOT NULL,
      "userId" VARCHAR(40)
      )`);
}

createScheme().then(() => {
  client.end();
  console.log('finished');
});
