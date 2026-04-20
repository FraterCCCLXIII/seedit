import { useState, type ReactNode } from 'react';
import {
  autoUpdate,
  FloatingPortal,
  offset,
  shift,
  useDismiss,
  useFloating,
  useFocus,
  useHover,
  useInteractions,
  useRole,
} from '@floating-ui/react';
import styles from './engagement-action-tooltip.module.css';

type EngagementActionTooltipProps = {
  content: string;
  children: ReactNode;
};

/**
 * Hover/focus tooltip for compact post engagement controls (comments, share).
 */
export function EngagementActionTooltip({ content, children }: EngagementActionTooltipProps) {
  const [open, setOpen] = useState(false);

  const { refs, floatingStyles, context } = useFloating({
    open,
    onOpenChange: setOpen,
    placement: 'top',
    middleware: [offset(6), shift({ padding: 8 })],
    whileElementsMounted: autoUpdate,
  });

  const hover = useHover(context, { delay: { open: 350, close: 80 }, move: false });
  const focus = useFocus(context);
  const dismiss = useDismiss(context);
  const role = useRole(context, { role: 'tooltip' });
  const { getReferenceProps, getFloatingProps } = useInteractions([hover, focus, dismiss, role]);

  return (
    <>
      <span className={styles.ref} ref={refs.setReference} {...getReferenceProps()}>
        {children}
      </span>
      {open && (
        <FloatingPortal>
          <div className={styles.tooltip} ref={refs.setFloating} style={floatingStyles} {...getFloatingProps()}>
            {content}
          </div>
        </FloatingPortal>
      )}
    </>
  );
}
