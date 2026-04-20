import { useState } from 'react';
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
import styles from './comment-sort-dropdown.module.css';

const SORT_OPTIONS = ['best', 'new', 'old'] as const;

export type CommentSortDropdownProps = {
  sortBy: string;
  onSortChange: (sort: string) => void;
};

export function CommentSortDropdown({ sortBy, onSortChange }: CommentSortDropdownProps) {
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);
  const baseId = useId();
  const labelId = `${baseId}-label`;
  const menuId = `${baseId}-menu`;

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

  return (
    <div className={styles.row}>
      <span className={styles.label} id={labelId}>
        {t('reply_sorted_by')}
        <span className={styles.labelColon} aria-hidden>
          :
        </span>
      </span>
      <button
        type='button'
        ref={refs.setReference}
        className={styles.trigger}
        aria-haspopup='menu'
        aria-expanded={open}
        aria-controls={open ? menuId : undefined}
        aria-labelledby={labelId}
        {...getReferenceProps()}
      >
        <span className={styles.triggerValue}>{t(sortBy)}</span>
        <span className={cn(styles.chevron, open && styles.chevronOpen)} aria-hidden />
      </button>
      {open && (
        <FloatingPortal>
          <FloatingFocusManager context={context} modal={false}>
            <div
              id={menuId}
              ref={refs.setFloating}
              className={styles.menu}
              style={floatingStyles}
              role='menu'
              aria-labelledby={labelId}
              {...getFloatingProps()}
            >
              {SORT_OPTIONS.map((item) => (
                <div
                  key={item}
                  role='menuitem'
                  className={cn(styles.menuItem, sortBy === item && styles.menuItemSelected)}
                  onClick={() => {
                    onSortChange(item);
                    setOpen(false);
                  }}
                >
                  {t(item)}
                </div>
              ))}
            </div>
          </FloatingFocusManager>
        </FloatingPortal>
      )}
    </div>
  );
}
