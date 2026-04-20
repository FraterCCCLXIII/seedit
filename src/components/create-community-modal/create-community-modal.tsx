import { useCallback, useEffect, useMemo } from 'react';
import { createPortal } from 'react-dom';
import { useTranslation } from 'react-i18next';
import { PixelIcon } from '@/components/ui/pixel-icon';
import { Button } from '@/components/ui/button';
import styles from './create-community-modal.module.css';

const SEEDIT_RELEASES_URL = 'https://github.com/bitsocialhq/seedit/releases/latest';

export type CreateCommunityModalProps = {
  open: boolean;
  onClose: () => void;
  isConnectedToRpc: boolean;
  onContinueToCreate: () => void;
};

const CreateCommunityModal = ({ open, onClose, isConnectedToRpc, onContinueToCreate }: CreateCommunityModalProps) => {
  const { t } = useTranslation();

  const { warningBody, warningHint } = useMemo(() => {
    const full = t('create_community_warning');
    const parts = full.split('\n\n');
    return {
      warningBody: parts[0]?.trim() ?? full,
      warningHint: parts[1]?.trim() ?? '',
    };
  }, [t]);

  const close = useCallback(() => {
    onClose();
  }, [onClose]);

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
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  if (!open) return null;

  return createPortal(
    <div className={styles.overlay} role='presentation' onClick={close}>
      <div
        className={styles.dialog}
        role='dialog'
        aria-modal='true'
        aria-labelledby='create-community-modal-title'
        onClick={(e) => e.stopPropagation()}
      >
        <button type='button' className={styles.closeButton} onClick={close} aria-label={t('close')}>
          <PixelIcon glyph='times' className={styles.closeIcon} aria-hidden />
        </button>
        <div className={styles.inner}>
          <h2 id='create-community-modal-title' className={styles.title}>
            {t('create_your_community')}
          </h2>
          {isConnectedToRpc ? (
            <p className={styles.body}>{t('create_community_modal_connected_hint')}</p>
          ) : (
            <>
              <p className={styles.body}>{warningBody}</p>
              {warningHint ? <p className={styles.hint}>{warningHint}</p> : null}
            </>
          )}
          <div className={styles.actions}>
            <Button type='button' variant='outline' onClick={close}>
              {t('cancel')}
            </Button>
            {isConnectedToRpc ? (
              <Button type='button' variant='neutral' onClick={onContinueToCreate}>
                {t('create_community')}
              </Button>
            ) : (
              <Button
                type='button'
                variant='neutral'
                onClick={() => {
                  window.open(SEEDIT_RELEASES_URL, '_blank', 'noopener,noreferrer');
                  close();
                }}
              >
                {t('create_community_open_downloads')}
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>,
    document.body,
  );
};

export default CreateCommunityModal;
