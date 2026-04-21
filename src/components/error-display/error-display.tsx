import { useCallback, useState } from 'react';
import { useTranslation } from 'react-i18next';
import useScheduledReset from '../../hooks/use-scheduled-reset';
import { copyToClipboard } from '../../lib/utils/clipboard-utils';
import { cn } from '@/lib/utils';
import styles from './error-display.module.css';

type ErrorDetails = {
  message?: string;
  stack?: string;
  details?: unknown;
};

const getErrorDetails = (error: unknown): ErrorDetails | null => {
  if (!error) return null;
  if (typeof error === 'string') {
    return { message: error };
  }
  if (error instanceof Error) {
    return { message: error.message, stack: error.stack };
  }
  if (typeof error === 'object') {
    const maybeError = error as { message?: unknown; stack?: unknown; details?: unknown };
    return {
      message: typeof maybeError.message === 'string' ? maybeError.message : undefined,
      stack: typeof maybeError.stack === 'string' ? maybeError.stack : undefined,
      details: maybeError.details,
    };
  }
  return { message: String(error) };
};

const stringifyError = (error: unknown) => {
  if (error instanceof Error) {
    return JSON.stringify({ name: error.name, message: error.message, stack: error.stack }, null, 2);
  }
  if (typeof error === 'string') {
    return error;
  }
  try {
    return JSON.stringify(error, null, 2);
  } catch {
    return String(error);
  }
};

/** Strip redundant `error:` / `err:` prefixes from upstream so UI is not `Error: error: …`. Sentence-case leading letter when needed. */
const normalizeErrorMessageForDisplay = (message: string): string => {
  let m = message.trim();
  for (let i = 0; i < 4; i += 1) {
    const next = m.replace(/^(error|err):\s*/i, '').trim();
    if (next === m) break;
    m = next;
  }
  if (m.length > 0 && /^[a-z]/.test(m[0])) {
    return m[0].toUpperCase() + m.slice(1);
  }
  return m;
};

export type ErrorDisplayProps = {
  error: unknown;
  /** `bar`: full-width strip under header (feed routes). Default: compact inline block. */
  variant?: 'inline' | 'bar';
  /** With `variant="bar"`: full-width strip in the feed main column (no horizontal shell padding). */
  fullBleed?: boolean;
};

const ErrorDisplay = ({ error, variant = 'inline', fullBleed = false }: ErrorDisplayProps) => {
  const { t } = useTranslation();
  const [feedbackMessageKey, setFeedbackMessageKey] = useState<string | null>(null);
  const errorDetails = getErrorDetails(error);

  const resetFeedback = useCallback(() => setFeedbackMessageKey(null), []);
  const [scheduleFeedbackReset] = useScheduledReset(resetFeedback, 1500);

  const normalizedMessage = errorDetails?.message ? normalizeErrorMessageForDisplay(errorDetails.message) : '';
  const originalDisplayMessage = normalizedMessage ? `${t('generic_error')}: ${normalizedMessage}` : null;

  const handleMessageClick = async () => {
    if (!errorDetails?.message || feedbackMessageKey) return;

    const errorString = stringifyError(error);
    try {
      await copyToClipboard(errorString);
      setFeedbackMessageKey('copied');
      scheduleFeedbackReset();
    } catch (err) {
      console.error('Failed to copy error: ', err);
      setFeedbackMessageKey('failed');
      scheduleFeedbackReset();
    }
  };

  let currentDisplayMessage = '';
  const classNames = [styles.errorMessage];
  let isClickable = false;

  if (feedbackMessageKey === 'copied') {
    currentDisplayMessage = t('fullErrorCopiedToClipboard', 'full error copied to the clipboard');
    classNames.pop();
    classNames.push(styles.feedbackSuccessMessage);
  } else if (feedbackMessageKey === 'failed') {
    currentDisplayMessage = t('copyFailed', 'copy failed');
  } else if (originalDisplayMessage) {
    currentDisplayMessage = originalDisplayMessage;
    isClickable = true;
    classNames.push(styles.clickableErrorMessage);
  }

  const shouldRender = Boolean(errorDetails?.message || errorDetails?.stack || errorDetails?.details || error);

  const rootClass = cn(variant === 'bar' ? styles.errorBar : styles.error, variant === 'bar' && fullBleed && styles.errorBarFullBleed);

  return (
    shouldRender && (
      <div className={rootClass} role={variant === 'bar' ? 'alert' : undefined} aria-live={variant === 'bar' ? 'polite' : undefined}>
        {currentDisplayMessage && (
          <span
            className={classNames.join(' ')}
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
