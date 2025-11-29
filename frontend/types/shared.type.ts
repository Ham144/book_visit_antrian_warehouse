export interface BaseProps {
  page?: number;
  searchKey?: string;
}

export enum SubscriptionPlan {
  TRIAL = "TRIAL",
  PRO = "PRO",
  PREMIUM = "PREMIUM",
}

export enum Recurring {
  CUSTOMDAY = "CUSTOMDAY",

  DAILY = "DAILY",
  WEEKLY = "WEEKLY",
  MONTHLY = "MONTHLY",
}

export enum Days {
  SENIN = "SENIN",
  SELASA = "SELASA",
  RABU = "RABU",
  KAMIS = "KAMIS",
  JUMAT = "JUMAT",
  SABTU = "SABTU",
  MINGGU = "MINGGU",
}
