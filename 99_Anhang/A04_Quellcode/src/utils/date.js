const DAY_MS = 24 * 60 * 60 * 1000;

function toDate(isoDate) {
  return new Date(`${isoDate}T00:00:00.000Z`);
}

function toIsoDate(date) {
  return date.toISOString().slice(0, 10);
}

function addDays(isoDate, days) {
  const date = toDate(isoDate);
  date.setUTCDate(date.getUTCDate() + days);
  return toIsoDate(date);
}

function dateRange(from, to) {
  const start = toDate(from);
  const end = toDate(to);
  const dates = [];

  for (let date = start; date <= end; date = new Date(date.getTime() + DAY_MS)) {
    dates.push(toIsoDate(date));
  }

  return dates;
}

function getIsoWeekday(isoDate) {
  const day = toDate(isoDate).getUTCDay();
  return day === 0 ? 7 : day;
}

function formatDuration(ms) {
  return `${ms.toFixed(3)}ms`;
}

function nowMs() {
  return Number(process.hrtime.bigint()) / 1e6;
}

function formatDateForTeams(isoDate) {
  const [year, month, day] = isoDate.split("-");
  return `${Number(month)}/${Number(day)}/${year}`;
}

function createTimestampedFileName(prefix = "generated-shifts") {
  const now = new Date();
  const year = String(now.getFullYear());
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  const hour = String(now.getHours()).padStart(2, "0");
  const minute = String(now.getMinutes()).padStart(2, "0");
  const second = String(now.getSeconds()).padStart(2, "0");
  return `${prefix}-${year}${month}${day}-${hour}${minute}${second}.xlsx`;
}

module.exports = {
  addDays,
  dateRange,
  getIsoWeekday,
  formatDuration,
  nowMs,
  formatDateForTeams,
  createTimestampedFileName,
};
