import { isAfter, isEqual, parseISO, } from 'date-fns';

export function isDateRangeValid(startISO: string, endISO: string): boolean {
  const s = parseISO(startISO);
  const e = parseISO(endISO);

  return isAfter(e, s);
};

export function doesOverlaps(
  aStartISO: string,
  aEndISO: string,
  bStartISO: string,
  bEndISO: string
): boolean {
  const aStart = parseISO(aStartISO);
  const aEnd = parseISO(aEndISO);
  const bStart = parseISO(bStartISO);
  const bEnd = parseISO(bEndISO);

  const aStartLtBEnd
    = isAfter(bEnd, aStart) || isEqual(bEnd, aStart) ? true : false;
  const bStartLtAEnd
    = isAfter(aEnd, bStart) || isEqual(aEnd, bStart) ? true : false;

  const aStartEqBEnd = isEqual(aStart, bEnd);
  const bStartEqAEnd = isEqual(bStart, aEnd);

  return aStartLtBEnd && bStartLtAEnd && !aStartEqBEnd && !bStartEqAEnd;
};

export function toISODateOnly(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
};
