import { useCallback, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { PixelIcon } from '@/components/ui/pixel-icon';
import SubmitPage from '../../views/submit-page';
import type { SubmitModalLocationState } from '../../lib/feed-shell-data';
import styles from './submit-modal.module.css';

/**
 * Submit flow in a modal overlay. When opened with `state.backgroundLocation` (from sidebar / header),
 * the feed stays mounted behind; closing runs `navigate(-1)`.
 */
const SubmitModal = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const state = location.state as SubmitModalLocationState | null;

  const close = useCallback(() => {
    if (state?.backgroundLocation) {
      navigate(-1);
    } else {
      navigate('/hot', { replace: true });
    }
  }, [navigate, state?.backgroundLocation]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') close();
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [close]);

  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = prev;
    };
  }, []);

  return (
    <div className={styles.overlay} role='presentation' onClick={close}>
      <div
        className={styles.dialog}
        role='dialog'
        aria-modal='true'
        aria-labelledby='submit-modal-heading'
        onClick={(e) => e.stopPropagation()}
      >
        <button type='button' className={styles.closeButton} onClick={close} aria-label='Close'>
          <PixelIcon glyph='times' className={styles.closeIcon} aria-hidden />
        </button>
        <div className={styles.body}>
          <SubmitPage variant='modal' />
        </div>
      </div>
    </div>
  );
};

export default SubmitModal;
