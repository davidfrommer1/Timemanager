
import express from 'express';
import { GenericDAO } from '../models/generic.dao';
import { Holiday } from '../models/holiday';
import { authService } from '../services/auth.service';

const router = express.Router();

router.get('/', authService.expressMiddleware, async (req, res) => {
  const holidayDAO: GenericDAO<Holiday> = req.app.locals.holidayDAO;
  const holidays = await holidayDAO.findAll({ userId: res.locals.user.id });
  res.json({ results: holidays });
});

router.post('/', authService.expressMiddleware, async (req, res) => {
  const holidayDAO: GenericDAO<Holiday> = req.app.locals.holidayDAO;
  const createdHoliday = await holidayDAO.create({
    userId: res.locals.user.id,
    title: req.body.title,
    fromdate: req.body.fromdate,
    todate: req.body.todate
  });
  res.status(201).json(createdHoliday);
});

router.get('/:id', authService.expressMiddleware, async (req, res) => {
  const holidayDAO: GenericDAO<Holiday> = req.app.locals.holidayDAO;
  const holiday = await holidayDAO.findOne({ id: req.params.id });
  if (!holiday) {
    res.status(404).json({ message: `Es existiert kein Urlaub mit der ID ${req.params.id}` });
  } else {
    res.status(200).json(holiday);
  }
});

router.patch('/:id', authService.expressMiddleware, async (req, res) => {
  const holidayDAO: GenericDAO<Holiday> = req.app.locals.holidayDAO;

  const partialHoliday: Partial<Holiday> = { id: req.params.id };
  if (req.body.title) {
    partialHoliday.title = req.body.title;
  }
  if (req.body.fromdate) {
    partialHoliday.fromdate = req.body.fromdate;
  }
  if (req.body.todate) {
    partialHoliday.todate = req.body.todate;
  }

  await holidayDAO.update(partialHoliday);
  res.status(200).end();
});

router.delete('/:id', authService.expressMiddleware, async (req, res) => {
  const holidayDAO: GenericDAO<Holiday> = req.app.locals.holidayDAO;
  await holidayDAO.delete(req.params.id);
  res.status(200).end();
});

export default router;
