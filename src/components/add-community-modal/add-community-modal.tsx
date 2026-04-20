import { useCallback, useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { useTranslation } from 'react-i18next';
import { setAccount, useAccount } from '@bitsocialnet/bitsocial-react-hooks';
import { PixelIcon } from '@/components/ui/pixel-icon';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { debugAddCommunity } from '@/lib/utils/add-community-debug';
import { normalizeSubplebbitAddressInput, validateSubplebbitAddressForSubscription } from '@/lib/utils/subplebbit-address-utils';
import styles from './add-community-modal.module.css';

export type AddCommunityModalProps = {
  open: boolean;
  onClose: () => void;
};

const AddCommunityModal = ({ open, onClose }: AddCommunityModalProps) => {
  const { t } = useTranslation();
  const account = useAccount();
  const [rawValue, setRawValue] = useState('');
  const [errorKey, setErrorKey] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const reset = useCallback(() => {
    setRawValue('');
    setErrorKey(null);
    setIsSubmitting(false);
  }, []);

  const close = useCallback(() => {
    reset();
    onClose();
  }, [onClose, reset]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') close();
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [open, close]);

  useEffect(() => {
    if (!open) return;
    debugAddCommunity('modal:open');
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  const handleSubmit = useCallback(async () => {
    debugAddCommunity('submit:start', {
      rawLength: rawValue.length,
      hasAccount: Boolean(account),
      subscriptionCount: account?.subscriptions?.length ?? 0,
    });
    if (!account) {
      debugAddCommunity('submit:blocked', { reason: 'no_account' });
      setErrorKey('add_community_error_no_account');
      return;
    }
    const normalized = normalizeSubplebbitAddressInput(rawValue);
    debugAddCommunity('submit:normalized', {
      normalizedLength: normalized.length,
      normalized,
    });
    const subs = account.subscriptions ?? [];
    const validation = validateSubplebbitAddressForSubscription(normalized, subs);
    if (validation) {
      debugAddCommunity('submit:validation_failed', { errorKey: validation });
      setErrorKey(validation);
      return;
    }
    setErrorKey(null);
    setIsSubmitting(true);
    try {
      const next = [...new Set([...subs, normalized])];
      debugAddCommunity('submit:setAccount', {
        previousSubscriptionCount: subs.length,
        nextSubscriptionCount: next.length,
      });
      await setAccount({
        ...account,
        subscriptions: next,
      });
      debugAddCommunity('submit:success', { nextSubscriptionCount: next.length });
      close();
    } catch (e) {
      debugAddCommunity('submit:setAccount_error', {
        message: e instanceof Error ? e.message : String(e),
      });
      console.error('add community subscription:', e);
      setErrorKey('add_community_error_save');
    } finally {
      setIsSubmitting(false);
    }
  }, [account, rawValue, close]);

  if (!open) return null;

  return createPortal(
    <div className={styles.overlay} role='presentation' onClick={close}>
      <div className={styles.dialog} role='dialog' aria-modal='true' aria-labelledby='add-community-modal-title' onClick={(e) => e.stopPropagation()}>
        <button type='button' className={styles.closeButton} onClick={close} aria-label={t('close')}>
          <PixelIcon glyph='times' className={styles.closeIcon} aria-hidden />
        </button>
        <div className={styles.inner}>
          <h2 id='add-community-modal-title' className={styles.title}>
            {t('add_community_modal_title')}
          </h2>
          <p className={styles.hint}>{t('add_community_hint')}</p>
          <div className={styles.field}>
            <Input
              className={styles.input}
              value={rawValue}
              onChange={(e) => {
                setRawValue(e.target.value);
                setErrorKey(null);
              }}
              placeholder={t('add_community_placeholder')}
              aria-label={t('add_community_modal_title')}
              autoComplete='off'
              spellCheck={false}
              disabled={isSubmitting}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  void handleSubmit();
                }
              }}
            />
          </div>
          {errorKey ? <p className={styles.error}>{t(errorKey)}</p> : null}
          <div className={styles.actions}>
            <Button type='button' variant='outline' onClick={close} disabled={isSubmitting}>
              {t('cancel')}
            </Button>
            <Button type='button' variant='neutral' onClick={() => void handleSubmit()} disabled={isSubmitting}>
              {isSubmitting ? t('loading') : t('add_community_submit')}
            </Button>
          </div>
        </div>
      </div>
    </div>,
    document.body,
  );
};

export default AddCommunityModal;
