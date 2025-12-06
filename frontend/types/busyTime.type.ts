import { Days, Recurring } from "./shared.type";

export interface IDockBusyTime {
  id?: string;
  from: string;
  to: string;
  reason: string;
  dockId: string;
  recurring: Recurring;
  recurringStep?: number; //daily weekly monthly
  recurringCustom?: Days[];
}
