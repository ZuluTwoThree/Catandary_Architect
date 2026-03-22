import { describe, it, expect } from 'vitest';
import { javaIntToHex } from '../parser/color-converter';

describe('javaIntToHex', () => {
  it('converts OPCat green (object color)', () => {
    expect(javaIntToHex(-16749056)).toBe('#006e00');
  });

  it('converts OPCat blue (process color)', () => {
    expect(javaIntToHex(-16777046)).toBe('#0000aa');
  });

  it('converts OPCat state yellow', () => {
    expect(javaIntToHex(-10790144)).toBe('#5b5b00');
  });

  it('converts black', () => {
    expect(javaIntToHex(-16777216)).toBe('#000000');
  });

  it('converts white', () => {
    expect(javaIntToHex(-1)).toBe('#ffffff');
  });

  it('converts a light background color', () => {
    expect(javaIntToHex(-1644826)).toBe('#e6e6e6');
  });

  it('handles zero (black with no alpha)', () => {
    expect(javaIntToHex(0)).toBe('#000000');
  });
});
