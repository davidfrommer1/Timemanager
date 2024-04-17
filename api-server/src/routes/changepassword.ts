import express from 'express';
import bcrypt from 'bcryptjs';
import { GenericDAO } from '../models/generic.dao';
import { User } from '../models/user';
import { authService } from '../services/auth.service';
import { WorkingTime } from '../models/workingtime';

const router = express.Router();

export default router;
