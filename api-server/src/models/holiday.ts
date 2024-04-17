
import { Entity } from './entity';

export interface Holiday extends Entity {
  userId: string;
  title: string;
  fromdate: string;
  todate: string;
}
