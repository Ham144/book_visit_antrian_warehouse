import { IDock } from "./dock.type";
import { Days, Recurring } from "./shared.type";

export interface IDockBusyTime {
  id?: string;
  from: string;
  to: string;
  reason: string;
  dockId: string;
  recurring: Recurring;
  dock?: IDock;
  recurringStep?: number; //daily weekly monthly
  recurringCustom?: Days[];
}
