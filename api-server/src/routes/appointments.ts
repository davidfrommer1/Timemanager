
import express from 'express';
import { GenericDAO } from '../models/generic.dao';
import { Appointment } from '../models/appointment';
import { authService } from '../services/auth.service';
import * as crypto from 'crypto';

const router = express.Router();

router.get('/', authService.expressMiddleware, async (req, res) => {
  const appointmentDAO: GenericDAO<Appointment> = req.app.locals.appointmentDAO;
  const appointments = (await appointmentDAO.findAll({ userId: res.locals.user.id })).map(appointment => {
    return { ...appointment, description: decrypt(appointment.description) };
  });
  res.json({ results: appointments });
});

router.post('/', authService.expressMiddleware, async (req, res) => {
  const appointmentDAO: GenericDAO<Appointment> = req.app.locals.appointmentDAO;
  const createdAppointment = await appointmentDAO.create({
    userId: res.locals.user.id,
    title: req.body.title,
    date: req.body.date,
    description: encrypt(req.body.description)
  });
  res.status(201).json({ ...createdAppointment, description: decrypt(createdAppointment.description) });
});

router.get('/:id', authService.expressMiddleware, async (req, res) => {
  const appointmentDAO: GenericDAO<Appointment> = req.app.locals.appointmentDAO;
  const appointment = await appointmentDAO.findOne({ id: req.params.id });
  if (!appointment) {
    res.status(404).json({ message: `Es existiert kein Termin mit der ID ${req.params.id}` });
  } else {
    res.status(200).json({ ...appointment, description: decrypt(appointment.description) });
  }
});

router.patch('/:id', authService.expressMiddleware, async (req, res) => {
  const appointmentDAO: GenericDAO<Appointment> = req.app.locals.appointmentDAO;

  const partialAppointment: Partial<Appointment> = { id: req.params.id };
  if (req.body.title) {
    partialAppointment.title = req.body.title;
  }
  if (req.body.date) {
    partialAppointment.date = req.body.date;
  }
  if (encrypt(req.body.description || '')) {
    partialAppointment.description = encrypt(req.body.description || '');
  }

  await appointmentDAO.update(partialAppointment);
  res.status(200).end();
});

router.delete('/:id', authService.expressMiddleware, async (req, res) => {
  const appointmentDAO: GenericDAO<Appointment> = req.app.locals.appointmentDAO;
  await appointmentDAO.delete(req.params.id);
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
