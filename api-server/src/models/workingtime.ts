
import { Entity } from './entity';

export interface WorkingTime extends Entity {
  date: string;
  duration: string;
  start: string;
  end: string;
  userId: string;
  email: string;
}
