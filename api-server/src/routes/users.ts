
import express from 'express';
import bcrypt from 'bcryptjs';
import { GenericDAO } from '../models/generic.dao';
import { User } from '../models/user';
import { Appointment } from '../models/appointment';
import { authService } from '../services/auth.service';

const router = express.Router();

router.post('/', async (req, res) => {
  const userDAO: GenericDAO<User> = req.app.locals.userDAO;
  const errors: string[] = [];

  const sendErrorMessage = (message: string) => {
    authService.removeToken(res);
    res.status(400).json({ message });
  };

  if (!hasRequiredFields(req.body, ['email', 'name', 'password', 'passwordCheck'], errors)) {
    return sendErrorMessage(errors.join('\n'));
  }

  if (req.body.password !== req.body.passwordCheck) {
    return sendErrorMessage('Passwörter stimmen nicht überein.');
  }
  const filter: Partial<User> = { email: req.body.email };
  if (await userDAO.findOne(filter)) {
    return sendErrorMessage('Anmeldedaten fehlerhaft.');
  }
  const createdUser = await userDAO.create({
    name: req.body.name,
    email: req.body.email,
    password: await bcrypt.hash(req.body.password, 10)
  });
  authService.createAndSetToken({ id: createdUser.id }, res);
  res.status(201).json(createdUser);
});

router.post('/sign-in', async (req, res) => {
  const userDAO: GenericDAO<User> = req.app.locals.userDAO;
  const filter: Partial<User> = { email: req.body.email };
  const errors: string[] = [];

  if (!hasRequiredFields(req.body, ['email', 'password'], errors)) {
    res.status(400).json({ message: errors.join('\n') });
    return;
  }

  const user = await userDAO.findOne(filter);

  if (user && (await bcrypt.compare(req.body.password, user.password))) {
    authService.createAndSetToken({ id: user.id }, res);
    res.status(201).json(user);
  } else {
    authService.removeToken(res);
    res.status(401).json({ message: 'Die E-Mail oder das Passwort sind ungültig!' });
  }
});

router.delete('/sign-out', (req, res) => {
  authService.removeToken(res);
  res.status(200).end();
});

router.delete('/', authService.expressMiddleware, async (req, res) => {
  const userDAO: GenericDAO<User> = req.app.locals.userDAO;
  const appointmentDAO: GenericDAO<Appointment> = req.app.locals.appointmentDAO;

  userDAO.delete(res.locals.user.id);
  appointmentDAO.deleteAll({ userId: res.locals.user.id });

  authService.removeToken(res);
  res.status(200).end();
});

router.patch('/:id', authService.expressMiddleware, async (req, res) => {
  const userDAO: GenericDAO<User> = req.app.locals.userDAO;
  const partialUser: Partial<User> = { id: res.locals.user.id };

  if (req.body.password) {
    partialUser.password = await bcrypt.hash(req.body.password, 10);
  }
  await userDAO.update(partialUser);
  res.status(200).end();
});

router.get('/', authService.expressMiddleware, async (req, res) => {
  const userDAO: GenericDAO<User> = req.app.locals.userDAO;
  const users = await userDAO.findAll({ id: res.locals.user.id });
  res.json({ results: users });
});

function hasRequiredFields(object: { [key: string]: unknown }, requiredFields: string[], errors: string[]) {
  let hasErrors = false;
  requiredFields.forEach(fieldName => {
    if (!object[fieldName]) {
      errors.push(fieldName + ' darf nicht leer sein.');
      hasErrors = true;
    }
  });
  return !hasErrors;
}

export default router;
