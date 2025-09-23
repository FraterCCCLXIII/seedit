import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { copyToClipboard } from '../../lib/utils/clipboard-utils';
// Removed CSS modules import - converted to Tailwind classes

const ErrorDisplay = ({ error }: { error: any }) => {
  const { t } = useTranslation();
  const [feedbackMessageKey, setFeedbackMessageKey] = useState<string | null>(null);

  const originalDisplayMessage = error?.message ? `${t('error')}: ${error.message}` : null;

  const handleMessageClick = async () => {
    if (!error || !error.message || feedbackMessageKey) return;

    const errorString = JSON.stringify(error, null, 2);
    try {
      await copyToClipboard(errorString);
      setFeedbackMessageKey('copied');
      setTimeout(() => {
        setFeedbackMessageKey(null);
      }, 1500);
    } catch (err) {
      console.error('Failed to copy error: ', err);
      setFeedbackMessageKey('failed');
      setTimeout(() => {
        setFeedbackMessageKey(null);
      }, 1500);
    }
  };

  let currentDisplayMessage = '';
  let classNames = 'text-red-500';
  let isClickable = false;

  if (feedbackMessageKey === 'copied') {
    currentDisplayMessage = t('fullErrorCopiedToClipboard', 'full error copied to the clipboard');
    classNames = 'text-gray-500';
  } else if (feedbackMessageKey === 'failed') {
    currentDisplayMessage = t('copyFailed', 'copy failed');
  } else if (originalDisplayMessage) {
    currentDisplayMessage = originalDisplayMessage;
    isClickable = true;
    classNames = 'text-red-500 cursor-pointer';
  }

  return (
    (error?.message || error?.stack || error?.details || error) && (
      <div>
        {currentDisplayMessage && (
          <span
            className={classNames}
            onClick={isClickable ? handleMessageClick : undefined}
            title={isClickable ? t('clickToCopyFullError', 'Click to copy full error') : undefined}
          >
            {currentDisplayMessage}
          </span>
        )}
      </div>
    )
  );
};

export default ErrorDisplay;
