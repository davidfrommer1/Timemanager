
import { MongoClient } from 'mongodb';
import { Client } from 'pg';
import { Express } from 'express';
import { MongoGenericDAO } from './models/mongo-generic.dao';
import { PsqlGenericDAO } from './models/psql-generic.dao';
import { InMemoryGenericDAO } from './models/in-memory-generic.dao';
import { User } from './models/user';
import { Appointment } from './models/appointment';
import { Holiday } from './models/holiday';
import { RecordTrip } from './models/recordtrip';
import { WorkingTime } from './models/workingtime';

export default async function startDB(app: Express, dbms = 'in-memory-db') {
  switch (dbms) {
    case 'mongodb':
      return await startMongoDB(app);
    case 'psql':
      return await startPsql(app);
    default:
      return await startInMemoryDB(app);
  }
}

async function startInMemoryDB(app: Express) {
  app.locals.appointmentDAO = new InMemoryGenericDAO<Appointment>();
  app.locals.holidayDAO = new InMemoryGenericDAO<Holiday>();
  app.locals.recordtripDAO = new InMemoryGenericDAO<RecordTrip>();
  app.locals.userDAO = new InMemoryGenericDAO<User>();
  app.locals.workingtimeDAO = new InMemoryGenericDAO<WorkingTime>();
  return async () => Promise.resolve();
}

async function startMongoDB(app: Express) {
  const client = await connectToMongoDB();
  const db = client.db('timemanager');
  app.locals.appointmentDAO = new MongoGenericDAO<Appointment>(db, 'appointments');
  app.locals.holidayDAO = new MongoGenericDAO<Holiday>(db, 'holidays');
  app.locals.recordtripDAO = new MongoGenericDAO<RecordTrip>(db, 'recordtrips');
  app.locals.userDAO = new MongoGenericDAO<User>(db, 'users');
  app.locals.workingtimeDAO = new MongoGenericDAO<WorkingTime>(db, 'workingtime');
  return async () => await client.close();
}

async function connectToMongoDB() {
  const url = 'mongodb://localhost:27017';
  const options = {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    auth: { user: 'admin', password: 'wifhm' },
    authSource: 'timemanager'
  };
  try {
    return await MongoClient.connect(url, options);
  } catch (err) {
    console.log('Could not connect to MongoDB: ', err.stack);
    process.exit(1);
  }
}

async function startPsql(app: Express) {
  const client = await connectToPsql();
  app.locals.appointmentDAO = new PsqlGenericDAO<Appointment>(client!, 'appointments');
  app.locals.holidayDAO = new PsqlGenericDAO<Holiday>(client!, 'holidays');
  app.locals.holidayDAO = new PsqlGenericDAO<RecordTrip>(client!, 'recordtrips');
  app.locals.userDAO = new PsqlGenericDAO<User>(client!, 'users');
  app.locals.workingtimeDAO = new PsqlGenericDAO<WorkingTime>(client!, 'workingtime');
  return async () => await client.end();
}

async function connectToPsql() {
  const client = new Client({
    user: 'admin',
    host: 'localhost',
    database: 'timemanager',
    password: 'wifhm',
    port: 5432
  });

  try {
    await client.connect();
    return client;
  } catch (err) {
    console.log('Could not connect to PostgreSQL: ', err.stack);
    process.exit(1);
  }
}
