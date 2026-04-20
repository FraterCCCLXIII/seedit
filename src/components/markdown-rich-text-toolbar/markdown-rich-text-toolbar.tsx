import type { RefObject } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Bold,
  Brackets,
  Eye,
  EyeOff,
  IndentIncrease,
  Italic,
  Link as LinkIcon,
  List,
  Quote,
  Strikethrough,
  Subscript,
  Superscript,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { prefixLinesInRange, wrapSelection } from '@/lib/markdown-textarea-format';
import styles from './markdown-rich-text-toolbar.module.css';

export type MarkdownRichTextToolbarProps = {
  textareaRef: RefObject<HTMLTextAreaElement | null>;
  value: string;
  onChange: (next: string) => void;
  /** When true, a rendered markdown panel is shown under the source editor */
  showMarkdownPreview: boolean;
  onToggleMarkdownPreview: () => void;
};

/**
 * Markdown formatting actions for comment/post composers (matches FormattingHelpTable).
 */
export function MarkdownRichTextToolbar({
  textareaRef,
  value,
  onChange,
  showMarkdownPreview,
  onToggleMarkdownPreview,
}: MarkdownRichTextToolbarProps) {
  const { t } = useTranslation();

  const restoreSelection = (start: number, end: number) => {
    requestAnimationFrame(() => {
      const el = textareaRef.current;
      if (!el) return;
      el.focus();
      el.setSelectionRange(start, end);
    });
  };

  const act = (fn: (v: string, s: number, e: number) => { value: string; selectionStart: number; selectionEnd: number }) => {
    const el = textareaRef.current;
    if (!el) return;
    const s = el.selectionStart;
    const e = el.selectionEnd;
    const r = fn(value, s, e);
    if (r.value === value && r.selectionStart === s && r.selectionEnd === e) return;
    onChange(r.value);
    restoreSelection(r.selectionStart, r.selectionEnd);
  };

  const onItalic = () =>
    act((v, s, e) => wrapSelection(v, s, e, '*', '*', t('italics')));

  const onBold = () =>
    act((v, s, e) => wrapSelection(v, s, e, '**', '**', t('bold')));

  const onStrike = () => act((v, s, e) => wrapSelection(v, s, e, '~~', '~~', t('strikethrough')));

  const onSup = () => act((v, s, e) => wrapSelection(v, s, e, '^', '^', t('superscript')));

  const onSub = () => act((v, s, e) => wrapSelection(v, s, e, '~', '~', t('subscript')));

  const onSpoiler = () =>
    act((v, s, e) => wrapSelection(v, s, e, '<spoiler>', '</spoiler>', t('spoiler_text')));

  const onLink = () => {
    const el = textareaRef.current;
    if (!el) return;
    const s = el.selectionStart;
    const e = el.selectionEnd;
    const url = window.prompt(t('rte_link_prompt'), 'https://');
    if (url === null || url === '') return;
    const r = wrapSelection(value, s, e, '[', `](${url})`, t('rte_link_text'));
    onChange(r.value);
    restoreSelection(r.selectionStart, r.selectionEnd);
  };

  const onList = () => act((v, s, e) => prefixLinesInRange(v, s, e, '* '));

  const onQuote = () => act((v, s, e) => prefixLinesInRange(v, s, e, '> '));

  const onCodeIndent = () => act((v, s, e) => prefixLinesInRange(v, s, e, '    '));

  return (
    <div className={styles.toolbar} role='toolbar' aria-label={t('rich_text')}>
      <div className={styles.formatGroup}>
        <Button
          type='button'
          variant='ghost'
          size='sm'
          className={styles.toolButton}
          onMouseDown={(ev) => ev.preventDefault()}
          onClick={onItalic}
          aria-label={t('italics')}
          title={t('italics')}
        >
          <Italic className={styles.toolIcon} strokeWidth={2} aria-hidden />
        </Button>
        <Button
          type='button'
          variant='ghost'
          size='sm'
          className={styles.toolButton}
          onMouseDown={(ev) => ev.preventDefault()}
          onClick={onBold}
          aria-label={t('bold')}
          title={t('bold')}
        >
          <Bold className={styles.toolIcon} strokeWidth={2} aria-hidden />
        </Button>
        <Button
          type='button'
          variant='ghost'
          size='sm'
          className={styles.toolButton}
          onMouseDown={(ev) => ev.preventDefault()}
          onClick={onLink}
          aria-label={t('rte_insert_link')}
          title={t('rte_insert_link')}
        >
          <LinkIcon className={styles.toolIcon} strokeWidth={2} aria-hidden />
        </Button>
        <Button
          type='button'
          variant='ghost'
          size='sm'
          className={styles.toolButton}
          onMouseDown={(ev) => ev.preventDefault()}
          onClick={onList}
          aria-label={t('rte_bullet_list')}
          title={t('rte_bullet_list')}
        >
          <List className={styles.toolIcon} strokeWidth={2} aria-hidden />
        </Button>
        <Button
          type='button'
          variant='ghost'
          size='sm'
          className={styles.toolButton}
          onMouseDown={(ev) => ev.preventDefault()}
          onClick={onQuote}
          aria-label={t('rte_quote')}
          title={t('rte_quote')}
        >
          <Quote className={styles.toolIcon} strokeWidth={2} aria-hidden />
        </Button>
        <Button
          type='button'
          variant='ghost'
          size='sm'
          className={styles.toolButton}
          onMouseDown={(ev) => ev.preventDefault()}
          onClick={onCodeIndent}
          aria-label={t('rte_code_indent')}
          title={t('rte_code_indent')}
        >
          <IndentIncrease className={styles.toolIcon} strokeWidth={2} aria-hidden />
        </Button>
        <Button
          type='button'
          variant='ghost'
          size='sm'
          className={styles.toolButton}
          onMouseDown={(ev) => ev.preventDefault()}
          onClick={onStrike}
          aria-label={t('strikethrough')}
          title={t('strikethrough')}
        >
          <Strikethrough className={styles.toolIcon} strokeWidth={2} aria-hidden />
        </Button>
        <Button
          type='button'
          variant='ghost'
          size='sm'
          className={styles.toolButton}
          onMouseDown={(ev) => ev.preventDefault()}
          onClick={onSup}
          aria-label={t('superscript')}
          title={t('superscript')}
        >
          <Superscript className={styles.toolIcon} strokeWidth={2} aria-hidden />
        </Button>
        <Button
          type='button'
          variant='ghost'
          size='sm'
          className={styles.toolButton}
          onMouseDown={(ev) => ev.preventDefault()}
          onClick={onSub}
          aria-label={t('subscript')}
          title={t('subscript')}
        >
          <Subscript className={styles.toolIcon} strokeWidth={2} aria-hidden />
        </Button>
        <Button
          type='button'
          variant='ghost'
          size='sm'
          className={styles.toolButton}
          onMouseDown={(ev) => ev.preventDefault()}
          onClick={onSpoiler}
          aria-label={t('spoiler')}
          title={t('spoiler')}
        >
          <EyeOff className={styles.toolIcon} strokeWidth={2} aria-hidden />
        </Button>
      </div>
      <div className={styles.toolbarEnd}>
        <Button
          type='button'
          variant={showMarkdownPreview ? 'secondary' : 'outline'}
          size='sm'
          className={styles.previewToggle}
          onClick={onToggleMarkdownPreview}
          aria-pressed={showMarkdownPreview}
        >
          {showMarkdownPreview ? (
            <>
              <Brackets className={styles.previewToggleIcon} strokeWidth={2} aria-hidden />
              {t('rte_view_markdown')}
            </>
          ) : (
            <>
              <Eye className={styles.previewToggleIcon} strokeWidth={2} aria-hidden />
              {t('preview')}
            </>
          )}
        </Button>
      </div>
    </div>
  );
}
