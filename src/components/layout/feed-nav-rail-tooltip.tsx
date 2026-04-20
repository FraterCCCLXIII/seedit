import { cloneElement, isValidElement, useState, type ReactElement, type ReactNode } from 'react';
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
import styles from './feed-nav-rail-tooltip.module.css';

function mergeRefs<T>(...refs: Array<React.Ref<T> | undefined>) {
  return (value: T | null) => {
    for (const ref of refs) {
      if (typeof ref === 'function') {
        ref(value);
      } else if (ref && typeof ref === 'object' && 'current' in ref) {
        (ref as React.MutableRefObject<T | null>).current = value;
      }
    }
  };
}

type FeedNavRailTooltipProps = {
  content: string;
  /** When false, children render with no tooltip (desktop wide rail). */
  enabled: boolean;
  children: ReactNode;
};

/**
 * Hover/focus tooltip for compact (icon-only) left rail; merges ref/props onto a single interactive child.
 */
export function FeedNavRailTooltip({ content, enabled, children }: FeedNavRailTooltipProps) {
  const [open, setOpen] = useState(false);

  const { refs, floatingStyles, context } = useFloating({
    open,
    onOpenChange: setOpen,
    placement: 'right',
    middleware: [offset(10), shift({ padding: 8 })],
    whileElementsMounted: autoUpdate,
  });

  const hover = useHover(context, { delay: { open: 350, close: 80 }, move: false });
  const focus = useFocus(context);
  const dismiss = useDismiss(context);
  const role = useRole(context, { role: 'tooltip' });
  const { getReferenceProps, getFloatingProps } = useInteractions([hover, focus, dismiss, role]);

  if (!enabled || !isValidElement(children)) {
    return <>{children}</>;
  }

  const child = children as ReactElement<{ ref?: React.Ref<HTMLElement>; title?: string }>;
  const referenceProps = getReferenceProps();
  const { ref: childRef, ...restChildProps } = child.props;

  return (
    <>
      {cloneElement(child, {
        ...restChildProps,
        ...referenceProps,
        title: content,
        ref: mergeRefs(refs.setReference, childRef),
      })}
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
