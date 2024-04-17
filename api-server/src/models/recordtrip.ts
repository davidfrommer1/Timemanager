
import { Entity } from './entity';

export interface RecordTrip extends Entity {
  userId: string;
  fromdate: string;
  todate: string;
  hours: string;
  destination: string;
  customer: string;
  note: string;
}
