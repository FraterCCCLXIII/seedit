import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { autoUpdate, flip, FloatingFocusManager, FloatingPortal, offset, shift, useClick, useDismiss, useFloating, useInteractions, useRole } from '@floating-ui/react';
import { PixelIcon } from '@/components/ui/pixel-icon';
import useFeedResetStore from '@/stores/use-feed-reset-store';
import styles from './feed-dev-header-menu.module.css';

/**
 * Dev-only: reset Virtuoso/feed state from the tab row.
 * Icon-only ⋯ trigger; bordered surface matches `Select` (language) field styling.
 */
export function FeedDevHeaderMenu() {
  const { t } = useTranslation();
  const reset = useFeedResetStore((s) => s.reset);
  const [open, setOpen] = useState(false);

  const { refs, floatingStyles, context } = useFloating({
    placement: 'bottom-end',
    open,
    onOpenChange: setOpen,
    middleware: [offset(6), flip({ fallbackAxisSideDirection: 'end' }), shift({ padding: 8 })],
    whileElementsMounted: autoUpdate,
  });

  const click = useClick(context);
  const dismiss = useDismiss(context);
  const role = useRole(context, { role: 'menu' });
  const { getReferenceProps, getFloatingProps } = useInteractions([click, dismiss, role]);

  const ariaMenu = t('feed_dev_menu_aria', { defaultValue: 'Developer menu' });
  const resetLabel = t('feed_dev_reset_feed', { defaultValue: 'Reset feed' });

  if (process.env.NODE_ENV === 'production' || !reset) {
    return null;
  }

  return (
    <div className={styles.slot}>
      <button
        ref={refs.setReference}
        type='button'
        className={styles.trigger}
        aria-label={ariaMenu}
        aria-expanded={open}
        aria-haspopup='menu'
        {...getReferenceProps()}
      >
        <PixelIcon glyph='comment-dots' className={styles.triggerIcon} aria-hidden />
      </button>
      {open && (
        <FloatingPortal>
          <FloatingFocusManager context={context} modal={false}>
            <div ref={refs.setFloating} style={floatingStyles} className={styles.menuPanel} {...getFloatingProps()}>
              <button
                type='button'
                role='menuitem'
                className={styles.menuItem}
                onClick={() => {
                  reset();
                  setOpen(false);
                }}
              >
                {resetLabel}
              </button>
            </div>
          </FloatingFocusManager>
        </FloatingPortal>
      )}
    </div>
  );
}
