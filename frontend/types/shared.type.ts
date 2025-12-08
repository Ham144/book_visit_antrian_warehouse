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

export enum DockType {
  MANUAL = "MANUAL",
  FORKLIFT = "FORKLIFT",
  SIDE = "SIDE",
  REEFER = "REEFER",
}

export enum VehicleType {
  PICKUP = "PICKUP",
  CDE = "CDE",
  CDD = "CDD",
  FUSO = "FUSO",
  TRONTON = "TRONTON",
  WINGBOX = "WINGBOX",
  CONTAINER20 = "CONTAINER20",
  CONTAINER40 = "CONTAINER40",
}

export enum DockRequirement {
  NONE = "NONE",
  FORKLIFT = "FORKLIFT",
  SIDE = "SIDE",
  REEFER = "REEFER",
}
