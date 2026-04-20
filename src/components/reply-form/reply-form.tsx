import { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useSubplebbit } from '@bitsocialnet/bitsocial-react-hooks';
import { cn } from '@/lib/utils';
import { isValidURL } from '../../lib/utils/url-utils';
import useIsSubplebbitOffline from '../../hooks/use-is-subplebbit-offline';
import usePublishReply from '../../hooks/use-publish-reply';
import Markdown from '../markdown';
import { MarkdownRichTextToolbar, MarkdownWysiwygField } from '../markdown-rich-text-toolbar';
import toolbarStyles from '../markdown-rich-text-toolbar/markdown-rich-text-toolbar.module.css';
import styles from './reply-form.module.css';

type ReplyFormProps = {
  cid: string;
  isReplyingToReply?: boolean;
  hideReplyForm?: () => void;
  subplebbitAddress: string;
  postCid: string | undefined;
};

export const FormattingHelpTable = () => {
  const { t } = useTranslation();
  return (
    <div className={styles.markdownHelp}>
      <table>
        <tbody>
          <tr className={styles.tableFirstRow}>
            <td>{t('you_type')}:</td>
            <td>{t('you_see')}:</td>
          </tr>
          <tr>
            <td>*{t('italics')}*</td>
            <td>
              <Markdown content={`*${t('italics')}*`} />
            </td>
          </tr>
          <tr>
            <td>**{t('bold')}**</td>
            <td>
              <Markdown content={`**${t('bold')}**`} />
            </td>
          </tr>
          <tr>
            <td>[plebbit!](https://plebbit.com)</td>
            <td>
              <Markdown content='[plebbit!](https://plebbit.com)' />
            </td>
          </tr>
          <tr>
            <td>
              * {t('item')} 1<br />* {t('item')} 2<br />* {t('item')} 3
            </td>
            <td>
              <Markdown content={[`* ${t('item')} 1`, `* ${t('item')} 2`, `* ${t('item')} 3`].join('\n')} />
            </td>
          </tr>
          <tr>
            <td>
              {'>'} {t('quoted_text')}
            </td>
            <td>
              <Markdown content={`> ${t('quoted_text')}`} />
            </td>
          </tr>
          <tr>
            <td>
              Lines starting with four spaces <br />
              are treated like code:
              <br />
              <br />
              <span className={styles.spaces}>&nbsp;&nbsp;&nbsp;&nbsp;</span>
              {'if 1 * 2 < 3:'}
              <br />
              <span className={styles.spaces}>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</span>
              print "hello, world!"
            </td>
            <td>
              Lines starting with four spaces <br />
              are treated like code:
              <br />
              <br />
              <Markdown content={`    if 1 * 2 < 3:\n        print "hello, world!"`} />
            </td>
          </tr>
          <tr>
            <td>~~strikethrough~~</td>
            <td>
              <Markdown content='~~strikethrough~~' />
            </td>
          </tr>
          <tr>
            <td>super^script^</td>
            <td>
              <Markdown content='super^script^' />
            </td>
          </tr>
          <tr>
            <td>sub~script~</td>
            <td>
              <Markdown content='sub~script~' />
            </td>
          </tr>
          <tr>
            <td>{`<spoiler>plebbit<spoiler>`}</td>
            <td>
              <Markdown content={`<spoiler>plebbit<spoiler>`} />
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  );
};

const ReplyForm = ({ cid, isReplyingToReply, hideReplyForm, subplebbitAddress, postCid }: ReplyFormProps) => {
  const { t } = useTranslation();
  const [showOptions, setShowOptions] = useState(false);
  const [showRichText, setShowRichText] = useState(false);
  const [isTextareaFocused, setIsTextareaFocused] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const { setPublishReplyOptions, resetPublishReplyOptions, replyIndex, publishReply, publishReplyOptions } = usePublishReply({ cid, subplebbitAddress, postCid });

  const mdContainerClass = isReplyingToReply ? `${styles.mdContainer} ${styles.mdContainerReplying}` : styles.mdContainer;

  const subplebbit = useSubplebbit({ subplebbitAddress, onlyIfCached: true });
  const { isOffline, offlineTitle } = useIsSubplebbitOffline(subplebbit);

  // focus on the textarea when replying to a reply
  const textRef = useRef<HTMLTextAreaElement>(null);
  const wysiwygRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!isReplyingToReply) return;
    if (showRichText && showPreview) {
      wysiwygRef.current?.focus();
    } else {
      textRef.current?.focus();
    }
  }, [isReplyingToReply, showRichText, showPreview]);

  const onPublish = () => {
    const currentContent = publishReplyOptions?.content || '';
    const currentUrl = publishReplyOptions?.link || '';

    if (!currentContent.trim() && !currentUrl) {
      alert(t('empty_comment_alert'));
      return;
    }

    if (currentUrl && !isValidURL(currentUrl)) {
      alert(t('invalid_url_alert'));
      return;
    }
    publishReply();
  };

  useEffect(() => {
    if (typeof replyIndex === 'number') {
      resetPublishReplyOptions();

      if (hideReplyForm) {
        hideReplyForm();
      }
    }
  }, [replyIndex, resetPublishReplyOptions, hideReplyForm]);

  return (
    <div className={mdContainerClass}>
      <div className={styles.md}>
        {isOffline && isTextareaFocused && <div className={styles.infobar}>{offlineTitle}</div>}
        {showRichText && (
          <MarkdownRichTextToolbar
            textareaRef={textRef}
            wysiwygRef={wysiwygRef}
            editorSurface={showPreview ? 'wysiwyg' : 'markdown'}
            value={publishReplyOptions?.content || ''}
            onChange={(next) => setPublishReplyOptions.content(next)}
            showMarkdownPreview={showPreview}
            onToggleMarkdownPreview={() => setShowPreview((v) => !v)}
          />
        )}
        {showRichText ? (
          showPreview ? (
            <MarkdownWysiwygField
              wysiwygRef={wysiwygRef}
              value={publishReplyOptions?.content || ''}
              onChange={(next) => setPublishReplyOptions.content(next)}
              className={cn(styles.textarea, toolbarStyles.attachedFieldBelowToolbar)}
              onFocus={() => setIsTextareaFocused(true)}
              onBlur={() => setIsTextareaFocused(false)}
            />
          ) : (
            <Textarea
              ref={textRef}
              className={cn(styles.textarea, toolbarStyles.attachedFieldBelowToolbar)}
              value={publishReplyOptions?.content || ''}
              onChange={(e) => setPublishReplyOptions.content(e.target.value)}
              onFocus={() => setIsTextareaFocused(true)}
              onBlur={() => setIsTextareaFocused(false)}
            />
          )
        ) : (
          <Textarea
            ref={textRef}
            className={styles.textarea}
            value={publishReplyOptions?.content || ''}
            onChange={(e) => setPublishReplyOptions.content(e.target.value)}
            onFocus={() => setIsTextareaFocused(true)}
            onBlur={() => setIsTextareaFocused(false)}
          />
        )}
        {showOptions && (
          <div className={styles.options}>
            <div className={styles.optionsMedia}>
              <label className={styles.optionsMediaLabel}>
                <span className={styles.optionsFieldCaption}>{t('media_url')}</span>
                <Input
                  className={styles.url}
                  value={publishReplyOptions?.link ?? ''}
                  onChange={(e) => setPublishReplyOptions.link(e.target.value)}
                />
              </label>
            </div>
            <div className={styles.optionsCheckboxes}>
              <span className={styles.spoiler}>
                <label className={styles.optionsCheckboxLabel}>
                  {t('spoiler')}
                  <Checkbox
                    checked={!!publishReplyOptions?.spoiler}
                    onChange={(e) => setPublishReplyOptions.spoiler(e.target.checked)}
                  />
                </label>
              </span>
              <span className={styles.spoiler}>
                <label className={styles.optionsCheckboxLabel}>
                  {t('nsfw')}
                  <Checkbox checked={!!publishReplyOptions?.nsfw} onChange={(e) => setPublishReplyOptions.nsfw(e.target.checked)} />
                </label>
              </span>
            </div>
          </div>
        )}
      </div>
      <div className={styles.bottomArea}>
        <Button type='button' variant='neutral' className={styles.save} onClick={onPublish}>
          {t('reply_form_comment')}
        </Button>
        {isReplyingToReply && (
          <Button type='button' variant='ghost' className={styles.cancel} onClick={hideReplyForm}>
            {t('cancel')}
          </Button>
        )}
        <span
          className={styles.optionsButton}
          onClick={() => {
            setShowRichText((v) => {
              const next = !v;
              if (next) setShowPreview(true);
              else setShowPreview(false);
              return next;
            });
          }}
        >
          {showRichText ? t('hide_rich_text') : t('rich_text')}
        </span>
        <span className={styles.optionsButton} onClick={() => setShowOptions(!showOptions)}>
          {showOptions ? t('hide_options') : t('options')}
        </span>
      </div>
    </div>
  );
};

export default ReplyForm;
