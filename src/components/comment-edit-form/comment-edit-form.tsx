import { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { PublishCommentEditOptions, useComment, useEditedComment, usePublishCommentEdit } from '@plebbit/plebbit-react-hooks';
import { FormattingHelpTable } from '../reply-form';
import styles from '../reply-form/reply-form.module.css';
import { alertChallengeVerificationFailed } from '../../lib/utils/challenge-utils';
import challengesStore from '../../stores/use-challenges-store';

const { addChallenge } = challengesStore.getState();

interface CommentEditFormProps {
  commentCid: string;
  hideCommentEditForm?: () => void;
}

const CommentEditForm = ({ commentCid, hideCommentEditForm }: CommentEditFormProps) => {
  const { t } = useTranslation();
  const [showOptions, setShowOptions] = useState(false);
  const [showFormattingHelp, setShowFormattingHelp] = useState(false);
  const spoilerClass = showOptions ? styles.spoilerVisible : styles.spoilerHidden;
  const textRef = useRef<HTMLTextAreaElement>(null);

  let post: any;
  const comment = useComment({ commentCid });
  const { editedComment } = useEditedComment({ comment });
  if (editedComment) {
    post = editedComment;
  } else if (comment) {
    post = comment;
  }

  const { content, edit, spoiler, subplebbitAddress } = post || {};

  const defaultPublishOptions: PublishCommentEditOptions = {
    commentCid,
    content,
    edit: { reason: edit?.reason },
    spoiler,
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

  useEffect(() => {
    if (textRef.current) {
      textRef.current.focus();
    }
  }, []);

  return (
    <div className={styles.mdContainer}>
      <div className={styles.md}>
        <div className={styles.options}>
          <span className={`${styles.spoiler} ${spoilerClass}`}>
            <label>
              {t('spoiler')}:{' '}
              <input
                type='checkbox'
                className={styles.checkbox}
                checked={publishCommentEditOptions.spoiler}
                onChange={(e) => setPublishCommentEditOptions((state) => ({ ...state, spoiler: e.target.checked }))}
              />
            </label>
          </span>
        </div>
        <textarea
          className={styles.textarea}
          value={publishCommentEditOptions.content}
          ref={textRef}
          onChange={(e) => setPublishCommentEditOptions((state) => ({ ...state, content: e.target.value }))}
        />
      </div>
      <div className={styles.bottomArea}>
        <span className={styles.editReason}>
          {t('edit_reason')}:{' '}
          <input
            className={styles.url}
            value={publishCommentEditOptions.edit?.reason}
            onChange={(e) => setPublishCommentEditOptions((state) => ({ ...state, edit: { reason: e.target.value } }))}
          />
        </span>
        <span className={styles.optionsButton} onClick={() => setShowFormattingHelp(!showFormattingHelp)}>
          {showFormattingHelp ? t('hide_help') : t('formatting_help')}
        </span>
        <span className={styles.optionsButton} onClick={() => setShowOptions(!showOptions)}>
          {showOptions ? t('hide_options') : t('options')}
        </span>
        <span className={styles.editSaveButtons}>
          <button
            className={styles.save}
            onClick={() => {
              publishCommentEdit();
              hideCommentEditForm && hideCommentEditForm();
            }}
          >
            {t('save')}
          </button>
          <button
            className={styles.cancel}
            onClick={() => {
              hideCommentEditForm && hideCommentEditForm();
            }}
          >
            {t('cancel')}
          </button>
        </span>
      </div>
      {showFormattingHelp && <FormattingHelpTable />}
    </div>
  );
};

export default CommentEditForm;
