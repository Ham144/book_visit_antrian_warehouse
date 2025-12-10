// Helper function to calculate duration
const getDuration = (from: string, to: string) => {
  const [fromHour, fromMinute] = from.split(":").map(Number);
  const [toHour, toMinute] = to.split(":").map(Number);

  let hourDiff = toHour - fromHour;
  let minuteDiff = toMinute - fromMinute;

  if (minuteDiff < 0) {
    minuteDiff += 60;
    hourDiff -= 1;
  }

  if (hourDiff < 0) {
    hourDiff += 24;
  }

  if (hourDiff === 0) {
    return `${minuteDiff} menit`;
  } else if (minuteDiff === 0) {
    return `${hourDiff} jam`;
  } else {
    return `${hourDiff} jam ${minuteDiff} menit`;
  }
};

export default getDuration;
