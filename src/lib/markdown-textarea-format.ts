/**
 * Helpers for inserting markdown in a controlled <textarea> (selection-aware).
 */

export function lineBoundsAt(value: string, pos: number): [number, number] {
  const p = Math.max(0, Math.min(pos, value.length));
  let a = p;
  let b = p;
  while (a > 0 && value[a - 1] !== '\n') a--;
  while (b < value.length && value[b] !== '\n') b++;
  return [a, b];
}

/** Expand range to include full first/last lines touched. */
export function expandToFullLines(value: string, start: number, end: number): [number, number] {
  const [ls] = lineBoundsAt(value, start);
  const [, le] = lineBoundsAt(value, Math.max(end - 1, start));
  return [ls, le];
}

export function wrapSelection(
  value: string,
  start: number,
  end: number,
  before: string,
  after: string,
  placeholder: string,
): { value: string; selectionStart: number; selectionEnd: number } {
  const selected = value.slice(start, end);
  const inner = selected || placeholder;
  const next = value.slice(0, start) + before + inner + after + value.slice(end);
  if (!selected) {
    const sel0 = start + before.length;
    const sel1 = sel0 + inner.length;
    return { value: next, selectionStart: sel0, selectionEnd: sel1 };
  }
  const c = start + before.length + inner.length + after.length;
  return { value: next, selectionStart: c, selectionEnd: c };
}

export function prefixLinesInRange(
  value: string,
  rangeStart: number,
  rangeEnd: number,
  prefix: string,
): { value: string; selectionStart: number; selectionEnd: number } {
  const [ls, le] =
    rangeStart === rangeEnd ? lineBoundsAt(value, rangeStart) : expandToFullLines(value, rangeStart, rangeEnd);
  const block = value.slice(ls, le);
  const lines = block.split('\n');
  const nextBlock = lines.map((line) => prefix + line).join('\n');
  const next = value.slice(0, ls) + nextBlock + value.slice(le);
  return {
    value: next,
    selectionStart: ls,
    selectionEnd: ls + nextBlock.length,
  };
}
