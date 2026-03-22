import type { OpmTime } from '../model/types';

/** A zero-duration OpmTime */
export const ZERO_TIME: OpmTime = {
  hours: 0,
  minutes: 0,
  seconds: 0,
  centiseconds: 0,
  milliseconds: 0,
  microseconds: 0,
  nanoseconds: 0,
  isInfinity: false,
};

/** An infinite OpmTime */
export const INFINITY_TIME: OpmTime = {
  ...ZERO_TIME,
  isInfinity: true,
};

/**
 * Parses OPM time format string: "h;m;s;cs;ms;us;ns" or "infinity"
 */
export function parseOpmTime(value: string | undefined | null): OpmTime {
  if (!value || value.trim() === '') {
    return { ...ZERO_TIME };
  }

  const trimmed = value.trim().toLowerCase();
  if (trimmed === 'infinity') {
    return { ...INFINITY_TIME };
  }

  const parts = trimmed.split(';').map(Number);
  return {
    hours: parts[0] ?? 0,
    minutes: parts[1] ?? 0,
    seconds: parts[2] ?? 0,
    centiseconds: parts[3] ?? 0,
    milliseconds: parts[4] ?? 0,
    microseconds: parts[5] ?? 0,
    nanoseconds: parts[6] ?? 0,
    isInfinity: false,
  };
}
