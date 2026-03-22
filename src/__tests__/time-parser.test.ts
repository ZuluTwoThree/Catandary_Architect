import { describe, it, expect } from 'vitest';
import { parseOpmTime, ZERO_TIME, INFINITY_TIME } from '../parser/time-parser';

describe('parseOpmTime', () => {
  it('parses zero time string', () => {
    const result = parseOpmTime('0;0;0;0;0;0;0');
    expect(result).toEqual(ZERO_TIME);
  });

  it('parses infinity', () => {
    const result = parseOpmTime('infinity');
    expect(result).toEqual(INFINITY_TIME);
  });

  it('parses case-insensitive infinity', () => {
    const result = parseOpmTime('Infinity');
    expect(result.isInfinity).toBe(true);
  });

  it('parses a non-zero duration', () => {
    const result = parseOpmTime('1;30;45;0;500;0;0');
    expect(result.hours).toBe(1);
    expect(result.minutes).toBe(30);
    expect(result.seconds).toBe(45);
    expect(result.centiseconds).toBe(0);
    expect(result.milliseconds).toBe(500);
    expect(result.isInfinity).toBe(false);
  });

  it('handles undefined', () => {
    expect(parseOpmTime(undefined)).toEqual(ZERO_TIME);
  });

  it('handles null', () => {
    expect(parseOpmTime(null)).toEqual(ZERO_TIME);
  });

  it('handles empty string', () => {
    expect(parseOpmTime('')).toEqual(ZERO_TIME);
  });
});
