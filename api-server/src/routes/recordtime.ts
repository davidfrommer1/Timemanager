import express from 'express';
import { GenericDAO } from '../models/generic.dao';
import { authService } from '../services/auth.service';
import { WorkingTime } from '../models/workingtime';

const router = express.Router();

router.get('/', authService.expressMiddleware, async (req, res) => {
  const workingtimeDAO: GenericDAO<WorkingTime> = req.app.locals.workingtimeDAO;
  const recordedTime = await workingtimeDAO.findAll({ userId: res.locals.user.id });
  res.json({ results: recordedTime });
});

router.post('/', authService.expressMiddleware, async (req, res) => {
  const workingtimeDAO: GenericDAO<WorkingTime> = req.app.locals.workingtimeDAO;
  const workingTime = await workingtimeDAO.create({
    userId: res.locals.user.id,
    date: req.body.date,
    start: req.body.start,
    end: req.body.end,
    duration: req.body.duration,
    email: req.body.email
  });
  res.status(201).json(workingTime);
});

router.delete('/:id', authService.expressMiddleware, async (req, res) => {
  const workingtimeDAO: GenericDAO<WorkingTime> = req.app.locals.workingtimeDAO;
  await workingtimeDAO.delete(req.params.id);
  res.status(200).end();
});

export default router;
