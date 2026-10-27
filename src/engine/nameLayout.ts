export interface NameLayout { lines: string[]; fontSize: number; lineHeight: number }

function wrapName(name: string, width: number, measure: (value: string) => number): string[] {
  const lines: string[] = [];
  let line = '';
  for (const word of name.split(/\s+/)) {
    const candidate = line ? `${line} ${word}` : word;
    if (measure(candidate) <= width) { line = candidate; continue; }
    if (line) { lines.push(line); line = ''; }
    if (measure(word) <= width) { line = word; continue; }
    for (const character of Array.from(word)) {
      if (line && measure(line + character) > width) { lines.push(line); line = ''; }
      line += character;
    }
  }
  if (line) lines.push(line);
  return lines;
}

/** Keep ordinary names on one or two readable lines; allow three for dense scripts. */
export function layoutName(name: string, width: number, maxSize: number, measure: (value: string, fontSize: number) => number): NameLayout {
  const clean = name.trim().replace(/\s+/g, ' ') || 'Your name here';
  for (let size = maxSize; size >= 44; size -= 2) {
    const lines = wrapName(clean, width, value => measure(value, size));
    if (lines.length <= 2) return { lines, fontSize: size, lineHeight: size * 1.08 };
  }
  for (let size = 44; size >= 32; size -= 2) {
    const lines = wrapName(clean, width, value => measure(value, size));
    if (lines.length <= 3 || size === 32) return { lines, fontSize: size, lineHeight: size * 1.08 };
  }
  throw new Error('Name layout could not be calculated');
}
