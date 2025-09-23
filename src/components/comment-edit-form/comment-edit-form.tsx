import { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { PublishCommentEditOptions, useComment, useEditedComment, usePublishCommentEdit } from '@plebbit/plebbit-react-hooks';
import { FormattingHelpTable } from '../reply-form';
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
  const [showFormattingHelp, setShowFormattingHelp] = useState(false);
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
      hideCommentEditForm && hideCommentEditForm();
      setShouldPublish(false);
    }
  }, [shouldPublish, publishCommentEdit, hideCommentEditForm]);

  useEffect(() => {
    if (textRef.current) {
      textRef.current.focus();
    }
  }, []);

  return (
        {showOptions && (
              {t('edit_reason')}:{' '}
              <input
                value={publishCommentEditOptions.reason}
                onChange={(e) => setPublishCommentEditOptions((state) => ({ ...state, reason: e.target.value }))}
              />
            </span>
              <label>
                {t('spoiler')}:{' '}
                <input
                  type='checkbox'
                  checked={publishCommentEditOptions.spoiler}
                  onChange={(e) => setPublishCommentEditOptions((state) => ({ ...state, spoiler: e.target.checked }))}
                />
              </label>
            </span>
              <label>
                {t('nsfw')}:{' '}
                <input
                  type='checkbox'
                  checked={publishCommentEditOptions.nsfw}
                  onChange={(e) => setPublishCommentEditOptions((state) => ({ ...state, nsfw: e.target.checked }))}
                />
              </label>
            </span>
          </div>
        )}
        {!showPreview ? (
          <textarea
            value={publishCommentEditOptions.content}
            ref={textRef}
            onChange={(e) => setPublishCommentEditOptions((state) => ({ ...state, content: e.target.value }))}
          />
        ) : (
            <Markdown content={publishCommentEditOptions.content} />
          </div>
        )}
      </div>
        <span
          onClick={() => {
            setShowFormattingHelp(!showFormattingHelp);
            if (showFormattingHelp) {
              setShowPreview(false);
            }
          }}
        >
          {showFormattingHelp ? t('hide_help') : t('formatting_help')}
        </span>
          {showOptions ? t('hide_options') : t('options')}
        </span>
        <button
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
        </button>
        {showFormattingHelp && (
            {showPreview ? t('edit') : t('preview')}
          </button>
        )}
        <button
          onClick={() => {
            hideCommentEditForm && hideCommentEditForm();
          }}
        >
          {t('cancel')}
        </button>
      </div>
      {showFormattingHelp && <FormattingHelpTable />}
    </div>
  );
};

export default CommentEditForm;
