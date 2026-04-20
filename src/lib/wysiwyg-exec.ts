/**
 * document.execCommand helpers for contenteditable surfaces (preview / rich mode).
 */

export function wysiwygFocus(el: HTMLElement | null) {
  el?.focus();
}

export function wysiwygExec(command: string, value: string | undefined, el: HTMLElement | null): boolean {
  wysiwygFocus(el);
  try {
    return document.execCommand(command, false, value);
  } catch {
    return false;
  }
}

export function wysiwygInsertHtml(html: string, el: HTMLElement | null): boolean {
  wysiwygFocus(el);
  try {
    return document.execCommand('insertHTML', false, html);
  } catch {
    return false;
  }
}

export function wysiwygWrapSelectionInSpoiler(el: HTMLElement | null): boolean {
  wysiwygFocus(el);
  const sel = window.getSelection();
  if (!sel || sel.rangeCount === 0 || !el?.contains(sel.anchorNode)) return false;
  const range = sel.getRangeAt(0);
  const span = document.createElement('span');
  span.setAttribute('data-seedit-spoiler', '1');
  try {
    span.appendChild(range.extractContents());
    range.insertNode(span);
    sel.removeAllRanges();
    const after = document.createRange();
    after.selectNodeContents(span);
    after.collapse(false);
    sel.addRange(after);
    return true;
  } catch {
    return false;
  }
}
