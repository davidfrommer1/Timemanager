
import { Entity } from './entity';

export interface Appointment extends Entity {
  title: string;
  date: string;
  description: string;
  userId: string;
}
