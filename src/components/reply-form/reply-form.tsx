import { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useSubplebbit } from '@plebbit/plebbit-react-hooks';
import { isValidURL } from '../../lib/utils/url-utils';
import useIsSubplebbitOffline from '../../hooks/use-is-subplebbit-offline';
import usePublishReply from '../../hooks/use-publish-reply';
import Markdown from '../markdown';

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
      <table>
        <tbody>
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
              {'if 1 * 2 < 3:'}
              <br />
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
  const [showFormattingHelp, setShowFormattingHelp] = useState(false);
  const [isTextareaFocused, setIsTextareaFocused] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const { setPublishReplyOptions, resetPublishReplyOptions, replyIndex, publishReply, publishReplyOptions } = usePublishReply({ cid, subplebbitAddress, postCid });


  const subplebbit = useSubplebbit({ subplebbitAddress, onlyIfCached: true });
  const { isOffline, offlineTitle } = useIsSubplebbitOffline(subplebbit);

  // focus on the textarea when replying to a reply
  const textRef = useRef<HTMLTextAreaElement>(null);
  useEffect(() => {
    if (isReplyingToReply && textRef.current) {
      textRef.current.focus();
    }
  }, [isReplyingToReply, textRef]);

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
        {showOptions && (
            <span className={urlClass}>
            </span>
              <label>
              </label>
            </span>
              <label>
              </label>
            </span>
          </div>
        )}
        {!showPreview ? (
          <textarea
            value={publishReplyOptions?.content || ''}
            onChange={(e) => setPublishReplyOptions.content(e.target.value)}
            onFocus={() => setIsTextareaFocused(true)}
            onBlur={() => setIsTextareaFocused(false)}
          />
        ) : (
            <Markdown content={publishReplyOptions?.content || ''} />
          </div>
        )}
      </div>
          {t('save')}
        </button>
        {showFormattingHelp && (
            {showPreview ? t('edit') : t('preview')}
          </button>
        )}
        {isReplyingToReply && (
            {t('cancel')}
          </button>
        )}
          {showFormattingHelp ? t('hide_help') : t('formatting_help')}
        </span>
          {showOptions ? t('hide_options') : t('options')}
        </span>
      </div>
      {showFormattingHelp && <FormattingHelpTable />}
    </div>
  );
};

export default ReplyForm;
