import { useCallback, useEffect, useLayoutEffect, useRef, type RefObject } from 'react';
import { cn } from '@/lib/utils';
import { markdownToWysiwygHtml, wysiwygHtmlToMarkdown } from '@/lib/markdown-wysiwyg-bridge';
import markdownStyles from '../markdown/markdown.module.css';

export type MarkdownWysiwygFieldProps = {
  value: string;
  onChange: (next: string) => void;
  wysiwygRef: RefObject<HTMLDivElement | null>;
  className?: string;
  onFocus?: () => void;
  onBlur?: () => void;
};

/**
 * Single contenteditable surface: rendered rich text synced to markdown source on input.
 */
export function MarkdownWysiwygField({ value, onChange, wysiwygRef, className, onFocus, onBlur }: MarkdownWysiwygFieldProps) {
  const lastEmittedRef = useRef(value);
  const isFocusedRef = useRef(false);

  useLayoutEffect(() => {
    lastEmittedRef.current = value;
    const el = wysiwygRef.current;
    if (!el) return;
    el.innerHTML = markdownToWysiwygHtml(value) || '<br>';
  }, []);

  useEffect(() => {
    const el = wysiwygRef.current;
    if (!el) return;
    if (value === lastEmittedRef.current) return;
    lastEmittedRef.current = value;
    if (!isFocusedRef.current) {
      el.innerHTML = markdownToWysiwygHtml(value) || '<br>';
    }
  }, [value, wysiwygRef]);

  const flush = useCallback(() => {
    const el = wysiwygRef.current;
    if (!el) return;
    const md = wysiwygHtmlToMarkdown(el.innerHTML);
    lastEmittedRef.current = md;
    onChange(md);
  }, [onChange, wysiwygRef]);

  const onInput = useCallback(() => {
    flush();
  }, [flush]);

  return (
    <div
      ref={wysiwygRef}
      className={cn(
        markdownStyles.markdown,
        'flex min-h-[60px] w-full rounded-control border border-input bg-background px-3 py-2 text-base shadow-sm transition-colors md:text-sm',
        'max-w-full min-w-0 overflow-x-auto break-words outline-none',
        'focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring',
        className,
      )}
      contentEditable
      suppressContentEditableWarning
      role='textbox'
      aria-multiline
      onInput={onInput}
      onFocus={() => {
        isFocusedRef.current = true;
        onFocus?.();
      }}
      onBlur={() => {
        isFocusedRef.current = false;
        flush();
        onBlur?.();
      }}
    />
  );
}
