import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { autoUpdate, flip, FloatingFocusManager, FloatingPortal, offset, shift, useClick, useDismiss, useFloating, useInteractions, useRole } from '@floating-ui/react';
import { PixelIcon } from '@/components/ui/pixel-icon';
import { createAccount, setActiveAccount, useAccount, useAccounts } from '@bitsocialnet/bitsocial-react-hooks';
import { cn } from '@/lib/utils';
import styles from './FeedNavRail.module.css';

type FeedNavAccountMenuProps = {
  /** Icon-only rail: native `title` + `aria-label` (avoid second Floating UI root on the trigger). */
  isCompact?: boolean;
};

/**
 * Account switcher docked to the bottom of the left rail (scroll is above in FeedNavRail).
 */
const FeedNavAccountMenu = ({ isCompact = false }: FeedNavAccountMenuProps) => {
  const { t } = useTranslation();
  const account = useAccount();
  const { accounts } = useAccounts();
  const [open, setOpen] = useState(false);

  const { refs, floatingStyles, context } = useFloating({
    placement: 'top-start',
    open,
    onOpenChange: setOpen,
    middleware: [offset(6), flip({ fallbackAxisSideDirection: 'end' }), shift({ padding: 8 })],
    whileElementsMounted: autoUpdate,
  });

  const click = useClick(context);
  const dismiss = useDismiss(context);
  const role = useRole(context, { role: 'menu' });
  const { getReferenceProps, getFloatingProps } = useInteractions([click, dismiss, role]);

  const shortAddress = account?.author?.shortAddress;
  const displayLabel = account?.author?.displayName || shortAddress;
  const triggerLabel = shortAddress ? `u/${shortAddress}` : displayLabel || t('feed_nav_settings', { defaultValue: 'Settings' });

  const accountRows = accounts.filter((a) => a?.author?.shortAddress);

  return (
    <div className={styles.accountDock}>
      <button
        ref={refs.setReference}
        type='button'
        className={styles.accountTrigger}
        {...getReferenceProps()}
        aria-expanded={open}
        aria-haspopup='menu'
        title={isCompact ? triggerLabel : undefined}
        aria-label={isCompact ? triggerLabel : undefined}
      >
        <span className={styles.accountTriggerLabel}>
          <PixelIcon glyph='user' className={styles.accountTriggerIcon} aria-hidden />
          <span className={styles.accountTriggerText}>{triggerLabel}</span>
        </span>
        <PixelIcon glyph='chevron-down' className={cn(styles.accountChevron, open && styles.accountChevronOpen)} aria-hidden />
      </button>
      {open && (
        <FloatingPortal>
          <FloatingFocusManager context={context} modal={false}>
            <div
              ref={refs.setFloating}
              style={floatingStyles}
              className='z-[100] min-w-[13rem] rounded-2xl border border-border bg-popover p-1 text-popover-foreground shadow-none outline-none'
              {...getFloatingProps()}
            >
              <div className='max-h-[min(60vh,18rem)] overflow-y-auto' role='none'>
                {accountRows.map((a) => {
                  const isActive = a.name === account?.name;
                  return (
                    <button
                      key={a.name}
                      type='button'
                      role='menuitem'
                      className={cn(
                        'flex w-full cursor-pointer items-center gap-2 rounded-control px-2 py-2 text-left text-sm',
                        'hover:bg-accent hover:text-accent-foreground',
                        isActive && 'bg-accent/50',
                      )}
                      onClick={() => {
                        setActiveAccount(a.name);
                        setOpen(false);
                      }}
                    >
                      <span className='min-w-0 flex-1 truncate'>u/{a.author!.shortAddress}</span>
                      {isActive && <PixelIcon glyph='check' className='h-4 w-4 shrink-0 text-base' aria-hidden />}
                    </button>
                  );
                })}
                <button
                  type='button'
                  role='menuitem'
                  className='w-full cursor-pointer rounded-control px-2 py-2 text-left text-sm hover:bg-accent hover:text-accent-foreground'
                  onClick={() => {
                    void createAccount();
                    setOpen(false);
                  }}
                >
                  {'+ ' + t('create')}
                </button>
              </div>
              <div className='my-1 h-px bg-border' role='separator' />
              <div role='none'>
                <Link
                  role='menuitem'
                  to='/profile'
                  className='block rounded-control px-2 py-2 text-sm hover:bg-accent hover:text-accent-foreground'
                  onClick={() => setOpen(false)}
                >
                  {t('feed_nav_profile', { defaultValue: 'Profile' })}
                </Link>
                <Link
                  role='menuitem'
                  to='/settings'
                  className='block rounded-control px-2 py-2 text-sm hover:bg-accent hover:text-accent-foreground'
                  onClick={() => setOpen(false)}
                >
                  {t('feed_nav_settings', { defaultValue: 'Settings' })}
                </Link>
              </div>
            </div>
          </FloatingFocusManager>
        </FloatingPortal>
      )}
    </div>
  );
};

export default FeedNavAccountMenu;
