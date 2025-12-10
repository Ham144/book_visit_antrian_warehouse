function decimalToMinutes(decimal: number) {
  const hh = Math.floor(decimal);
  const mm = Math.round((decimal - hh) * 60);
  return hh * 60 + mm;
}
export default decimalToMinutes;
