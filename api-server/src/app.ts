/* Autor: Prof. Dr. Norman Lahme-Hütig (FH Münster) */

import program from 'commander';
import express, { Express } from 'express';
import bodyParser from 'body-parser';
import cookieParser from 'cookie-parser';
import http from 'http';
import https from 'https';
import fs from 'fs';
import path from 'path';
// TODO: Routen importieren
import users from './routes/users';
import recordedtime from './routes/recordtime';
import appointments from './routes/appointments';
import holidays from './routes/holidays';
import recordtrips from './routes/recordtrips';
//import changepassword from './routes/changepassword';

import startDB from './db';
import { corsService } from './services/cors.service';

const reports: any = [];

function configureApp(app: Express) {
  app.use(bodyParser.urlencoded({ extended: true }));
  app.use(bodyParser.json({ type: ['json', 'application/csp-report'] }));
  app.use(cookieParser());
  app.use(corsService.expressMiddleware);
  // TODO: Routen einbinden
  app.use((req, res, next) => {
    res.set(
      'Content-Security-Policy',
      "script-src 'self'; style-src 'self'; frame-ancestor 'none'; report-uri /reports"
    );
    res.set('Strict-Transport-Security', 'max-age=10886400; includeSubDomains'); // -> HTTPS wird erzwungen, max-age: Dauer für die Erzwingung von HTTPS
    res.set('Feature-Policy', "vibrate 'none'; geolocation 'self'; camera 'self'; microphone 'self'");
    res.set('Cross-Origin-Ressource-Policy', 'same-origin');
    next();
  });
  app.post('/reports', (req, res) => {
    reports.push(req.body);
    res.sendStatus(204);
  });
  app.get('/reports', (req, res) => {
    res.json({ data: reports });
  });
  app.use('/api/users', users);
  app.use('/api/recordtime', recordedtime);
  app.use('/api/appointments', appointments);
  app.use('/api/holidays', holidays);
  app.use('/api/recordtrips', recordtrips);
  app.use('/api/changepassword', users);
}

export async function start(port: number, dbms = 'in-memory-db', withHttps = false) {
  const app = express();

  configureApp(app);
  const stopDB = await startDB(app, dbms);
  const stopHttpServer = await startHttpServer(app, port, withHttps);

  return async () => {
    await stopHttpServer();
    await stopDB();
  };
}

async function startHttpServer(app: Express, port: number, withHttps: boolean) {
  const createOptions = () => {
    const certDir = path.join(__dirname, 'certs');
    return {
      key: fs.readFileSync(path.join(certDir, 'server.key.pem')),
      cert: fs.readFileSync(path.join(certDir, 'server.cert.pem')),
      ca: fs.readFileSync(path.join(certDir, 'intermediate-ca.cert.pem'))
    };
  };
  const httpServer = withHttps ? https.createServer(createOptions(), app) : http.createServer(app);
  await new Promise<void>(resolve => {
    httpServer.listen(port, () => {
      console.log(`Server running at https://localhost:${port}`);
      resolve();
    });
  });
  return async () => await new Promise<void>(resolve => httpServer.close(() => resolve()));
}

if (require.main === module) {
  program
    .option('-d, --dbms <mongodb|psql|in-memory-db>', 'dbms to use (default: "in-memory-db")')
    .option('-s, --https', 'use https (default: http')
    .description('Starts the API server')
    .action(async cmd => {
      start(cmd.https ? 3443 : 3000, cmd.dbms, cmd.https);
    });

  program.parse(process.argv);
}
