function hhmmToMinutes(hhmm: string) {
  const [hh, mm] = hhmm.split(":").map(Number);
  return hh * 60 + mm;
}
export default hhmmToMinutes;
