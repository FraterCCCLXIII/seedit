import { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useSubplebbit } from '@plebbit/plebbit-react-hooks';
import { isValidURL } from '../../lib/utils/url-utils';
import useIsSubplebbitOffline from '../../hooks/use-is-subplebbit-offline';
import usePublishReply from '../../hooks/use-publish-reply';
import Markdown from '../markdown';
// Removed CSS modules import - converted to Tailwind classes

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
    <div className='block py-1 px-1 mt-1.5 border-t border-dotted border-gray-400'>
      <table className='w-full mt-1.5 font-normal text-gray-700 dark:text-gray-300 text-sm border-collapse box-border text-left border-spacing-2 border-gray-500'>
        <tbody>
          <tr className='bg-yellow-100 dark:bg-yellow-900 text-center lowercase italic'>
            <td className='py-1.5 px-2 w-1/2 border border-gray-400 text-left leading-5'>{t('you_type')}:</td>
            <td className='py-1.5 px-2 w-1/2 border border-gray-400 text-left leading-5'>{t('you_see')}:</td>
          </tr>
          <tr>
            <td className='py-1.5 px-2 w-1/2 border border-gray-400 text-left leading-5'>*{t('italics')}*</td>
            <td className='py-1.5 px-2 w-1/2 border border-gray-400 text-left leading-5'>
              <Markdown content={`*${t('italics')}*`} />
            </td>
          </tr>
          <tr>
            <td className='py-1.5 px-2 w-1/2 border border-gray-400 text-left leading-5'>**{t('bold')}**</td>
            <td className='py-1.5 px-2 w-1/2 border border-gray-400 text-left leading-5'>
              <Markdown content={`**${t('bold')}**`} />
            </td>
          </tr>
          <tr>
            <td className='py-1.5 px-2 w-1/2 border border-gray-400 text-left leading-5'>[plebbit!](https://plebbit.com)</td>
            <td className='py-1.5 px-2 w-1/2 border border-gray-400 text-left leading-5'>
              <Markdown content='[plebbit!](https://plebbit.com)' />
            </td>
          </tr>
          <tr>
            <td className='py-1.5 px-2 w-1/2 border border-gray-400 text-left leading-5'>
              * {t('item')} 1<br />* {t('item')} 2<br />* {t('item')} 3
            </td>
            <td className='py-1.5 px-2 w-1/2 border border-gray-400 text-left leading-5'>
              <Markdown content={[`* ${t('item')} 1`, `* ${t('item')} 2`, `* ${t('item')} 3`].join('\n')} />
            </td>
          </tr>
          <tr>
            <td className='py-1.5 px-2 w-1/2 border border-gray-400 text-left leading-5'>
              {'>'} {t('quoted_text')}
            </td>
            <td className='py-1.5 px-2 w-1/2 border border-gray-400 text-left leading-5'>
              <Markdown content={`> ${t('quoted_text')}`} />
            </td>
          </tr>
          <tr>
            <td className='py-1.5 px-2 w-1/2 border border-gray-400 text-left leading-5 break-words hyphens-auto'>
              Lines starting with four spaces <br />
              are treated like code:
              <br />
              <br />
              <span className='bg-gray-300 dark:bg-gray-600'>&nbsp;&nbsp;&nbsp;&nbsp;</span>
              {'if 1 * 2 < 3:'}
              <br />
              <span className='bg-gray-300 dark:bg-gray-600'>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</span>
              print "hello, world!"
            </td>
            <td className='py-1.5 px-2 w-1/2 border border-gray-400 text-left leading-5 break-words hyphens-auto'>
              Lines starting with four spaces <br />
              are treated like code:
              <br />
              <br />
              <Markdown content={`    if 1 * 2 < 3:\n        print "hello, world!"`} />
            </td>
          </tr>
          <tr>
            <td className='py-1.5 px-2 w-1/2 border border-gray-400 text-left leading-5'>~~strikethrough~~</td>
            <td className='py-1.5 px-2 w-1/2 border border-gray-400 text-left leading-5'>
              <Markdown content='~~strikethrough~~' />
            </td>
          </tr>
          <tr>
            <td className='py-1.5 px-2 w-1/2 border border-gray-400 text-left leading-5'>super^script^</td>
            <td className='py-1.5 px-2 w-1/2 border border-gray-400 text-left leading-5'>
              <Markdown content='super^script^' />
            </td>
          </tr>
          <tr>
            <td className='py-1.5 px-2 w-1/2 border border-gray-400 text-left leading-5'>sub~script~</td>
            <td className='py-1.5 px-2 w-1/2 border border-gray-400 text-left leading-5'>
              <Markdown content='sub~script~' />
            </td>
          </tr>
          <tr>
            <td className='py-1.5 px-2 w-1/2 border border-gray-400 text-left leading-5'>{`<spoiler>plebbit<spoiler>`}</td>
            <td className='py-1.5 px-2 w-1/2 border border-gray-400 text-left leading-5'>
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

  const mdContainerClass = isReplyingToReply
    ? 'text-sm px-0.5 max-w-[500px] isolate mt-1.5 -mb-2 pb-2.5 border-l-4 border-orange-300 dark:border-orange-600 ml-6'
    : 'text-sm px-0.5 max-w-[500px] isolate mt-1.5 -mb-2 pb-2.5';
  const urlClass = showOptions ? 'inline-block' : 'hidden';
  const spoilerClass = showOptions ? 'inline-block' : 'hidden';
  const nsfwClass = showOptions ? 'inline-block' : 'hidden';

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
      <div className='mb-1.5 font-normal w-full max-w-[60em]'>
        {isOffline && isTextareaFocused && (
          <div className='w-full box-border bg-orange-100 dark:bg-orange-900 border border-orange-300 dark:border-orange-700 py-1.5 px-2.5 text-gray-800 dark:text-gray-200 break-words text-sm'>
            {offlineTitle}
          </div>
        )}
        {showOptions && (
          <div className='text-xs pb-0.5 pt-0.5 flex gap-2.5 mb-0 overflow-hidden'>
            <span className={urlClass}>
              {t('media_url')}:{' '}
              <input className={`bg-white dark:bg-gray-900 text-gray-700 dark:text-gray-300 ${urlClass}`} onChange={(e) => setPublishReplyOptions.link(e.target.value)} />
            </span>
            <span className={`pl-1.5 ${spoilerClass}`}>
              <label>
                {t('spoiler')}: <input type='checkbox' onChange={(e) => setPublishReplyOptions.spoiler(e.target.checked)} />
              </label>
            </span>
            <span className={`pl-1.5 ${nsfwClass}`}>
              <label>
                {t('nsfw')}: <input type='checkbox' onChange={(e) => setPublishReplyOptions.nsfw(e.target.checked)} />
              </label>
            </span>
          </div>
        )}
        {!showPreview ? (
          <textarea
            className='w-full h-[100px] bg-white dark:bg-gray-900 text-gray-700 dark:text-gray-300 font-verdana text-sm leading-[1.42em] break-words box-border'
            value={publishReplyOptions?.content || ''}
            onChange={(e) => setPublishReplyOptions.content(e.target.value)}
            onFocus={() => setIsTextareaFocused(true)}
            onBlur={() => setIsTextareaFocused(false)}
          />
        ) : (
          <div className='min-h-[98.5px] break-words pl-1 pt-1 text-sm text-gray-800 dark:text-gray-200'>
            <Markdown content={publishReplyOptions?.content || ''} />
          </div>
        )}
      </div>
      <div>
        <button className='my-1.5 mr-1.5 ml-0 appearance-none cursor-pointer py-0.5 px-1.5 lowercase' onClick={onPublish}>
          {t('save')}
        </button>
        {showFormattingHelp && (
          <button
            className='my-1.5 mr-1.5 ml-0 appearance-none cursor-pointer py-0.5 px-1.5 lowercase'
            onClick={() => setShowPreview(!showPreview)}
            disabled={!publishReplyOptions?.content}
          >
            {showPreview ? t('edit') : t('preview')}
          </button>
        )}
        {isReplyingToReply && (
          <button className='my-1.5 mr-1.5 ml-0 appearance-none cursor-pointer py-0.5 px-1.5 lowercase' onClick={hideReplyForm}>
            {t('cancel')}
          </button>
        )}
        <span
          className='text-xs float-right mt-1.5 ml-2.5 mr-1.5 text-gray-600 dark:text-gray-400 cursor-pointer lowercase'
          onClick={() => setShowFormattingHelp(!showFormattingHelp)}
        >
          {showFormattingHelp ? t('hide_help') : t('formatting_help')}
        </span>
        <span className='text-xs float-right mt-1.5 ml-2.5 mr-1.5 text-gray-600 dark:text-gray-400 cursor-pointer lowercase' onClick={() => setShowOptions(!showOptions)}>
          {showOptions ? t('hide_options') : t('options')}
        </span>
      </div>
      {showFormattingHelp && <FormattingHelpTable />}
    </div>
  );
};

export default ReplyForm;
