import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { autoUpdate, flip, FloatingFocusManager, FloatingPortal, offset, shift, useClick, useDismiss, useFloating, useInteractions, useRole } from '@floating-ui/react';
import { Check, ChevronDown, User } from 'lucide-react';
import { createAccount, setActiveAccount, useAccount, useAccounts } from '@bitsocialnet/bitsocial-react-hooks';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

/**
 * Account switcher + create account in the feed left rail (desktop).
 * Floating UI menu (no @radix-ui/react-dropdown-menu) so installs work without that dependency.
 */
const FeedNavAccountMenu = () => {
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
  const triggerLabel = shortAddress ? `u/${shortAddress}` : displayLabel || t('preferences');

  const accountRows = accounts.filter((a) => a?.author?.shortAddress);

  return (
    <div className='mt-auto w-full min-w-0 border-t border-border pt-3'>
      <Button
        ref={refs.setReference}
        type='button'
        variant='ghost'
        {...getReferenceProps()}
        className={cn(
          'h-auto w-full justify-between gap-1.5 rounded-lg px-2 py-2 text-left font-normal text-foreground shadow-none',
          'hover:bg-accent hover:text-accent-foreground',
        )}
        aria-expanded={open}
        aria-haspopup='menu'
      >
        <span className='flex min-w-0 flex-1 items-center gap-2'>
          <User className='h-4 w-4 shrink-0 opacity-80' aria-hidden />
          <span className='truncate text-sm'>{triggerLabel}</span>
        </span>
        <ChevronDown className={cn('h-4 w-4 shrink-0 opacity-70 transition-transform duration-200', open && 'rotate-180')} aria-hidden />
      </Button>
      {open && (
        <FloatingPortal>
          <FloatingFocusManager context={context} modal={false}>
            <div
              ref={refs.setFloating}
              style={floatingStyles}
              className='z-[100] min-w-[13rem] rounded-md border border-border bg-popover p-1 text-popover-foreground shadow-md outline-none'
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
                        'flex w-full cursor-pointer items-center gap-2 rounded-sm px-2 py-2 text-left text-sm',
                        'hover:bg-accent hover:text-accent-foreground',
                        isActive && 'bg-accent/50',
                      )}
                      onClick={() => {
                        setActiveAccount(a.name);
                        setOpen(false);
                      }}
                    >
                      <span className='min-w-0 flex-1 truncate'>u/{a.author!.shortAddress}</span>
                      {isActive && <Check className='h-4 w-4 shrink-0' aria-hidden />}
                    </button>
                  );
                })}
                <button
                  type='button'
                  role='menuitem'
                  className='w-full cursor-pointer rounded-sm px-2 py-2 text-left text-sm hover:bg-accent hover:text-accent-foreground'
                  onClick={() => {
                    void createAccount();
                    setOpen(false);
                  }}
                >
                  +{t('create')}
                </button>
              </div>
              <div className='my-1 h-px bg-border' role='separator' />
              <div role='none'>
                <Link
                  role='menuitem'
                  to='/profile'
                  className='block rounded-sm px-2 py-2 text-sm hover:bg-accent hover:text-accent-foreground'
                  onClick={() => setOpen(false)}
                >
                  {t('overview')}
                </Link>
                <Link
                  role='menuitem'
                  to='/settings'
                  className='block rounded-sm px-2 py-2 text-sm hover:bg-accent hover:text-accent-foreground'
                  onClick={() => setOpen(false)}
                >
                  {t('preferences')}
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
