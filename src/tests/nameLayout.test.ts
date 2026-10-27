import { describe, expect, it } from 'vitest';
import { layoutName } from '../engine/nameLayout';

// Deterministic proportional-font approximation; real Canvas metrics are checked in-browser.
const measure = (value: string, size: number) => Array.from(value).reduce((width, c) => width + (c === ' ' ? .3 : /[A-ZMW]/.test(c) ? .7 : .54) * size, 0);

describe('Readable card names', () => {
  it('keeps a short name large and intact', () => {
    const result = layoutName('Samira Khan', 900, 90, measure);
    expect(result.lines).toEqual(['Samira Khan']);
    expect(result.fontSize).toBe(90);
  });
  it('wraps the previously problematic long name instead of shrinking into a tiny line', () => {
    const name = 'Aditya Venkatesh Balasubramanian Chandrasekhar Subramanian';
    const result = layoutName(name, 820, 78, measure);
    expect(result.lines.length).toBeGreaterThan(1);
    expect(result.lines.length).toBeLessThanOrEqual(2);
    expect(result.fontSize).toBeGreaterThanOrEqual(44);
    expect(result.lines.join(' ')).toBe(name);
    result.lines.forEach(line => expect(measure(line, result.fontSize)).toBeLessThanOrEqual(820));
  });
  it('fits a long unbroken name without dropping characters', () => {
    const name = 'W'.repeat(60);
    const result = layoutName(name, 820, 78, measure);
    expect(result.lines.join('')).toBe(name);
    expect(result.lines.length).toBeLessThanOrEqual(3);
    result.lines.forEach(line => expect(measure(line, result.fontSize)).toBeLessThanOrEqual(820));
  });
  it('preserves dense-script names within the same name area', () => {
    const name = '林'.repeat(60);
    const result = layoutName(name, 820, 78, (value, size) => Array.from(value).length * size);
    expect(result.lines.join('')).toBe(name);
    expect(result.lines.length).toBeLessThanOrEqual(3);
    expect(result.fontSize).toBeGreaterThanOrEqual(40);
  });
  it('normalizes extra whitespace and gives empty previews a readable placeholder', () => {
    expect(layoutName('  Samira   Khan  ', 900, 90, measure).lines.join(' ')).toBe('Samira Khan');
    expect(layoutName('   ', 900, 90, measure).lines.join(' ')).toBe('Your name here');
  });
});
