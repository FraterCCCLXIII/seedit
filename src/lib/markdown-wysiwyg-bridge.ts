import { parse, setOptions } from 'marked';
import TurndownService from 'turndown';

/** Use top-level `setOptions` / `parse` — some bundlers do not attach `setOptions` to the `marked` function export. */
setOptions({
  gfm: true,
  breaks: true,
});

function createTurndown(): TurndownService {
  const td = new TurndownService({
    headingStyle: 'atx',
    codeBlockStyle: 'fenced',
    emDelimiter: '*',
    strongDelimiter: '**',
    bulletListMarker: '*',
  });

  td.addRule('strikethrough', {
    filter: ['del', 's', 'strike'],
    replacement: (content: string) => (content ? `~~${content}~~` : ''),
  });

  td.addRule('spoiler', {
    filter: (node: Node): node is HTMLElement =>
      node.nodeType === 1 && (node as HTMLElement).nodeName === 'SPAN' && (node as HTMLElement).getAttribute('data-seedit-spoiler') !== null,
    replacement: (_content: string, node: Node) => {
      const el = node as HTMLElement;
      return `<spoiler>${el.innerHTML}</spoiler>`;
    },
  });

  td.addRule('seeditSpoilerTag', {
    filter: (node: Node): node is HTMLElement =>
      node.nodeType === 1 && (node as HTMLElement).tagName.toLowerCase() === 'spoiler',
    replacement: (_content: string, node: Node) => {
      const el = node as HTMLElement;
      return `<spoiler>${el.innerHTML}</spoiler>`;
    },
  });

  td.addRule('superscript', {
    filter: 'sup',
    replacement: (content: string) => (content ? `^${content}^` : ''),
  });

  td.addRule('subscript', {
    filter: 'sub',
    replacement: (content: string) => (content ? `~${content}~` : ''),
  });

  return td;
}

let turndownSingleton: TurndownService | null = null;
function getTurndown(): TurndownService {
  if (!turndownSingleton) turndownSingleton = createTurndown();
  return turndownSingleton;
}

/** Normalize spoiler tags so the editor uses a span turndown can round-trip. */
function normalizeSpoilersForEditor(md: string): string {
  return md.replace(/<spoiler>([\s\S]*?)<\/spoiler>/gi, '<span data-seedit-spoiler="1">$1</span>');
}

export function markdownToWysiwygHtml(markdown: string): string {
  const raw = (markdown || '').trim();
  if (!raw) return '';
  const withSpoilers = normalizeSpoilersForEditor(raw);
  return parse(withSpoilers, { async: false }) as string;
}

export function wysiwygHtmlToMarkdown(html: string): string {
  const doc = new DOMParser().parseFromString(`<div id="rte-root">${html}</div>`, 'text/html');
  const root = doc.getElementById('rte-root');
  if (!root) return '';
  const inner = root.innerHTML.trim();
  if (!inner || inner === '<br>' || inner === '<br/>') return '';
  const text = root.textContent?.trim() ?? '';
  if (!text && !inner.includes('<img') && !inner.includes('<iframe')) return '';
  return getTurndown().turndown(root).trim();
}
