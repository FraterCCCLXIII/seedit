import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  autoUpdate,
  flip,
  FloatingFocusManager,
  FloatingPortal,
  offset,
  shift,
  useClick,
  useDismiss,
  useFloating,
  useId,
  useInteractions,
  useRole,
} from '@floating-ui/react';
import { cn } from '@/lib/utils';
import styles from './inbox-filter-dropdown.module.css';

const INBOX_FILTER_PATHS = ['/inbox', '/inbox/unread', '/inbox/commentreplies', '/inbox/postreplies'] as const;
type InboxFilterPath = (typeof INBOX_FILTER_PATHS)[number];

const PATH_TO_LABEL_KEY: Record<InboxFilterPath, string> = {
  '/inbox': 'all',
  '/inbox/unread': 'unread',
  '/inbox/commentreplies': 'comment_replies',
  '/inbox/postreplies': 'post_replies',
};

function inboxFilterPathForLocation(pathname: string): InboxFilterPath {
  if (pathname === '/inbox/unread' || pathname === '/inbox/commentreplies' || pathname === '/inbox/postreplies') {
    return pathname;
  }
  return '/inbox';
}

export function InboxFilterDropdown() {
  const { t } = useTranslation();
  const location = useLocation();
  const navigate = useNavigate();
  const currentPath = inboxFilterPathForLocation(location.pathname);
  const [open, setOpen] = useState(false);
  const baseId = useId();
  const menuId = `${baseId}-menu`;
  const filterLabel = t('inbox_filter', { defaultValue: 'Filter notifications' });

  const { refs, floatingStyles, context } = useFloating({
    open,
    onOpenChange: setOpen,
    placement: 'bottom-start',
    middleware: [offset(6), flip({ fallbackAxisSideDirection: 'start' }), shift({ padding: 8 })],
    whileElementsMounted: autoUpdate,
  });

  const click = useClick(context);
  const dismiss = useDismiss(context);
  const role = useRole(context, { role: 'menu' });
  const { getReferenceProps, getFloatingProps } = useInteractions([click, dismiss, role]);

  const pick = (path: InboxFilterPath) => {
    navigate(path);
    setOpen(false);
  };

  return (
    <div className={styles.root}>
      <button
        type='button'
        ref={refs.setReference}
        className={styles.trigger}
        aria-label={filterLabel}
        aria-haspopup='menu'
        aria-expanded={open}
        aria-controls={open ? menuId : undefined}
        {...getReferenceProps()}
      >
        <span className={styles.triggerValue}>{t(PATH_TO_LABEL_KEY[currentPath])}</span>
        <span className={cn(styles.chevron, open && styles.chevronOpen)} aria-hidden />
      </button>
      {open && (
        <FloatingPortal>
          <FloatingFocusManager context={context} modal={false}>
            <div id={menuId} ref={refs.setFloating} className={styles.menu} style={floatingStyles} role='menu' aria-label={filterLabel} {...getFloatingProps()}>
              {INBOX_FILTER_PATHS.map((path) => (
                <div key={path} role='menuitem' className={cn(styles.menuItem, currentPath === path && styles.menuItemSelected)} onClick={() => pick(path)}>
                  {t(PATH_TO_LABEL_KEY[path])}
                </div>
              ))}
            </div>
          </FloatingFocusManager>
        </FloatingPortal>
      )}
    </div>
  );
}
