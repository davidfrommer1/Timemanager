
import express from 'express';
import { GenericDAO } from '../models/generic.dao';
import { RecordTrip } from '../models/recordtrip';
import { authService } from '../services/auth.service';
import * as crypto from 'crypto';

const router = express.Router();

router.get('/', authService.expressMiddleware, async (req, res) => {
  const recordtripDAO: GenericDAO<RecordTrip> = req.app.locals.recordtripDAO;
  const recordtrips = await (await recordtripDAO.findAll({ userId: res.locals.user.id })).map(recordtrip => {
    return { ...recordtrip, destination: decrypt(recordtrip.destination), customer: decrypt(recordtrip.customer) };
  });

  res.json({ results: recordtrips });
});

router.post('/', authService.expressMiddleware, async (req, res) => {
  const recordtripDAO: GenericDAO<RecordTrip> = req.app.locals.recordtripDAO;
  const createdRecordtrip = await recordtripDAO.create({
    userId: res.locals.user.id,
    fromdate: req.body.fromdate,
    todate: req.body.todate,
    hours: req.body.hours,
    destination: encrypt(req.body.destination),
    customer: encrypt(req.body.customer),
    note: req.body.note
  });
  res.status(201).json({
    ...createdRecordtrip,
    destination: decrypt(createdRecordtrip.destination),
    customer: decrypt(createdRecordtrip.customer)
  });
});

router.get('/:id', authService.expressMiddleware, async (req, res) => {
  const recordtripDAO: GenericDAO<RecordTrip> = req.app.locals.recordtripDAO;
  const recordtrip = await recordtripDAO.findOne({ id: req.params.id });
  if (!recordtrip) {
    res.status(404).json({ message: `Es existiert keine Reise mit der ID ${req.params.id}` });
  } else {
    res
      .status(200)
      .json({ ...recordtrip, destination: decrypt(recordtrip.destination), customer: decrypt(recordtrip.customer) });
  }
});

router.patch('/:id', authService.expressMiddleware, async (req, res) => {
  const recordtripDAO: GenericDAO<RecordTrip> = req.app.locals.recordtripDAO;

  const partialRecordtrip: Partial<RecordTrip> = { id: req.params.id };
  if (req.body.fromdate) {
    partialRecordtrip.fromdate = req.body.fromdate;
  }
  if (req.body.todate) {
    partialRecordtrip.todate = req.body.todate;
  }
  if (req.body.hours) {
    partialRecordtrip.hours = req.body.hours;
  }
  if (encrypt(req.body.destination)) {
    partialRecordtrip.destination = encrypt(req.body.destination);
  }
  if (encrypt(req.body.customer)) {
    partialRecordtrip.customer = encrypt(req.body.customer);
  }
  if (req.body.note) {
    partialRecordtrip.note = req.body.note;
  }

  await recordtripDAO.update(partialRecordtrip);
  res.status(200).end();
});

router.delete('/:id', authService.expressMiddleware, async (req, res) => {
  const recordtripDAO: GenericDAO<RecordTrip> = req.app.locals.recordtripDAO;
  await recordtripDAO.delete(req.params.id);
  res.status(200).end();
});

const algorithm = 'aes-256-cbc';
const keyBase64 = 's9p1PG9edXqxNWaBXORZ1SPVSQ7Gwan5XgKlAudOkBI=';

function encrypt(text: string) {
  if (!text) return '';
  const iv = crypto.randomBytes(16); // Blocklänge: 128 Bit
  const key = Buffer.from(keyBase64, 'base64');
  const cipher = crypto.createCipheriv(algorithm, key, iv);
  const ivPlusCipherText = Buffer.concat([iv, cipher.update(text, 'utf8'), cipher.final()]);
  return ivPlusCipherText.toString('base64');
}

function decrypt(ivPlusCipherTextBase64: string) {
  if (!ivPlusCipherTextBase64) return '';
  const buffer = Buffer.from(ivPlusCipherTextBase64, 'base64');
  const [iv, ciphertext] = [buffer.slice(0, 16), buffer.slice(16)];
  const key = Buffer.from(keyBase64, 'base64');
  const decipher = crypto.createDecipheriv(algorithm, key, iv);
  return decipher.update(ciphertext, undefined, 'utf8') + decipher.final('utf8');
}

export default router;
