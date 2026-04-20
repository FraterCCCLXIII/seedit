import { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { PublishCommentEditOptions, useComment, useEditedComment, usePublishCommentEdit } from '@bitsocialnet/bitsocial-react-hooks';
import { MarkdownRichTextToolbar } from '../markdown-rich-text-toolbar';
import toolbarStyles from '../markdown-rich-text-toolbar/markdown-rich-text-toolbar.module.css';
import styles from '../reply-form/reply-form.module.css';
import { cn } from '@/lib/utils';
import { alertChallengeVerificationFailed } from '../../lib/utils/challenge-utils';
import challengesStore from '../../stores/use-challenges-store';
import Markdown from '../markdown';

const { addChallenge } = challengesStore.getState();

interface CommentEditFormProps {
  commentCid: string;
  hideCommentEditForm?: () => void;
}

const CommentEditForm = ({ commentCid, hideCommentEditForm }: CommentEditFormProps) => {
  const { t } = useTranslation();
  const [showOptions, setShowOptions] = useState(false);
  const [showRichText, setShowRichText] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const textRef = useRef<HTMLTextAreaElement>(null);

  let post: any;
  const comment = useComment({ commentCid });

  const { editedComment } = useEditedComment({ comment });
  if (editedComment) {
    post = editedComment;
  } else if (comment) {
    post = comment;
  }

  const { content, reason, spoiler, nsfw, subplebbitAddress } = post || {};

  const defaultPublishOptions: PublishCommentEditOptions = {
    commentCid,
    content,
    reason,
    spoiler,
    nsfw,
    subplebbitAddress,
    onChallenge: (...args: any) => addChallenge([...args, post]),
    onChallengeVerification: alertChallengeVerificationFailed,
    onError: (error: Error) => {
      console.warn(error);
      alert(error.message);
    },
  };

  const [publishCommentEditOptions, setPublishCommentEditOptions] = useState(defaultPublishOptions);
  const { publishCommentEdit } = usePublishCommentEdit(publishCommentEditOptions);

  // the user might manually type "edit: <reason>" in the content field
  // we want to extract the reason and remove it from the content
  const parseEditContent = (content: string) => {
    const lines = content.trim().split('\n');
    const lastLine = lines[lines.length - 1];

    if (lastLine?.toLowerCase().startsWith('edit:')) {
      const newContent = lines.slice(0, -1).join('\n').trim();
      return {
        content: newContent,
        reason: lastLine.substring(5).trim(), // remove "edit:" prefix
      };
    }

    return { content, reason: publishCommentEditOptions.reason };
  };

  const [shouldPublish, setShouldPublish] = useState(false);

  useEffect(() => {
    if (shouldPublish) {
      publishCommentEdit();
      if (hideCommentEditForm) hideCommentEditForm();
      setShouldPublish(false);
    }
  }, [shouldPublish, publishCommentEdit, hideCommentEditForm]);

  useEffect(() => {
    if (textRef.current) {
      textRef.current.focus();
    }
  }, []);

  return (
    <div className={styles.mdContainer}>
      <div className={styles.md}>
        {showRichText && (
          <MarkdownRichTextToolbar
            textareaRef={textRef}
            value={publishCommentEditOptions.content}
            onChange={(next) => setPublishCommentEditOptions((state) => ({ ...state, content: next }))}
            showMarkdownPreview={showPreview}
            onToggleMarkdownPreview={() => setShowPreview((v) => !v)}
          />
        )}
        {showRichText ? (
          <>
            <Textarea
              className={cn(
                styles.textarea,
                toolbarStyles.attachedFieldBelowToolbar,
                showPreview && toolbarStyles.attachedEditorWhenPreviewBelow,
              )}
              value={publishCommentEditOptions.content}
              ref={textRef}
              onChange={(e) => setPublishCommentEditOptions((state) => ({ ...state, content: e.target.value }))}
            />
            {showPreview && (
              <div className={toolbarStyles.attachedLivePreviewBelow}>
                <div className={styles.preview}>
                  <Markdown content={publishCommentEditOptions.content} />
                </div>
              </div>
            )}
          </>
        ) : (
          <Textarea
            className={styles.textarea}
            value={publishCommentEditOptions.content}
            ref={textRef}
            onChange={(e) => setPublishCommentEditOptions((state) => ({ ...state, content: e.target.value }))}
          />
        )}
        {showOptions && (
          <div className={styles.options}>
            <div className={styles.optionsMedia}>
              <label className={styles.optionsMediaLabel}>
                <span className={styles.optionsFieldCaption}>{t('edit_reason')}</span>
                <Input
                  className={styles.url}
                  value={publishCommentEditOptions.reason ?? ''}
                  onChange={(e) => setPublishCommentEditOptions((state) => ({ ...state, reason: e.target.value }))}
                />
              </label>
            </div>
            <div className={styles.optionsCheckboxes}>
              <span className={styles.spoiler}>
                <label className={styles.optionsCheckboxLabel}>
                  {t('spoiler')}
                  <Checkbox
                    checked={!!publishCommentEditOptions.spoiler}
                    onChange={(e) => setPublishCommentEditOptions((state) => ({ ...state, spoiler: e.target.checked }))}
                  />
                </label>
              </span>
              <span className={styles.spoiler}>
                <label className={styles.optionsCheckboxLabel}>
                  {t('nsfw')}
                  <Checkbox
                    checked={!!publishCommentEditOptions.nsfw}
                    onChange={(e) => setPublishCommentEditOptions((state) => ({ ...state, nsfw: e.target.checked }))}
                  />
                </label>
              </span>
            </div>
          </div>
        )}
      </div>
      <div className={styles.bottomArea}>
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
        <Button
          type='button'
          className={styles.save}
          onClick={() => {
            const { content, reason } = parseEditContent(publishCommentEditOptions.content);
            setPublishCommentEditOptions((state) => ({
              ...state,
              content,
              reason,
            }));
            setShouldPublish(true);
          }}
        >
          {t('save')}
        </Button>
        <Button
          type='button'
          variant='ghost'
          className={styles.cancel}
          onClick={() => {
            if (hideCommentEditForm) hideCommentEditForm();
          }}
        >
          {t('cancel')}
        </Button>
      </div>
    </div>
  );
};

export default CommentEditForm;
