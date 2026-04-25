export function toISODate(d) {
  const x = typeof d === "string" ? new Date(d + "T12:00:00") : new Date(d);
  return x.toISOString().slice(0, 10);
}

export function todayISO() {
  return toISODate(new Date());
}

export function addDaysISO(isoDate, deltaDays) {
  const d = new Date(isoDate + "T12:00:00");
  d.setDate(d.getDate() + deltaDays);
  return d.toISOString().slice(0, 10);
}

export function daysInMonth(year, monthIndex) {
  return new Date(year, monthIndex + 1, 0).getDate();
}

/** Weekday Mon–Fri count between two ISO dates (inclusive). */
export function countWorkingDays(fromISO, toISO) {
  const start = new Date(fromISO + "T12:00:00");
  const end = new Date(toISO + "T12:00:00");
  if (end < start) return 0;
  let n = 0;
  const cur = new Date(start);
  while (cur <= end) {
    const wd = cur.getDay();
    if (wd !== 0 && wd !== 6) n++;
    cur.setDate(cur.getDate() + 1);
  }
  return n;
}

export function monthRangeISO(year, monthIndex) {
  const pad = (m) => String(m).padStart(2, "0");
  const last = daysInMonth(year, monthIndex);
  return {
    from: `${year}-${pad(monthIndex + 1)}-01`,
    to: `${year}-${pad(monthIndex + 1)}-${pad(last)}`,
  };
}

/** Inclusive calendar days between two ISO date strings. */
export function countInclusiveCalendarDays(fromISO, toISO) {
  const start = new Date(fromISO + "T12:00:00");
  const end = new Date(toISO + "T12:00:00");
  if (end < start) return 0;
  return Math.round((end - start) / 86400000) + 1;
}

/** Merge overlapping/adjacent [from,to] intervals (ISO dates), then sum calendar days. */
export function sumMergedCalendarDays(intervals) {
  if (!intervals?.length) return 0;
  const sorted = [...intervals].sort((a, b) => a.from.localeCompare(b.from));
  const merged = [sorted[0]];
  for (let i = 1; i < sorted.length; i++) {
    const cur = sorted[i];
    const last = merged[merged.length - 1];
    if (cur.from <= last.to) {
      if (cur.to > last.to) last.to = cur.to;
    } else {
      merged.push({ from: cur.from, to: cur.to });
    }
  }
  return merged.reduce((acc, iv) => acc + countInclusiveCalendarDays(iv.from, iv.to), 0);
}
