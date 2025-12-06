import { Days } from "./shared.type";

export interface Vacant {
  id?: String;
  availableFrom?: String | null;
  availableUntil?: String | null;
  day?: Days;
}
