import { type ReactNode, useLayoutEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
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
import styles from './header.module.css';

export type HeaderTabItem = {
  id: string;
  to: string;
  label: string;
  selected: boolean;
  preventNavigation?: boolean;
};

const MORE_RESERVE_PX = 48;

function TabMoreMenu({ items }: { items: HeaderTabItem[] }) {
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);
  const baseId = useId();
  const menuId = `${baseId}-tab-overflow`;

  const { refs, floatingStyles, context } = useFloating({
    open,
    onOpenChange: setOpen,
    placement: 'bottom-end',
    middleware: [offset(4), flip(), shift({ padding: 8 })],
    whileElementsMounted: autoUpdate,
  });

  const click = useClick(context);
  const dismiss = useDismiss(context);
  const role = useRole(context, { role: 'menu' });
  const { getReferenceProps, getFloatingProps } = useInteractions([click, dismiss, role]);

  return (
    <>
      <button
        type='button'
        ref={refs.setReference}
        className={styles.tabOverflowTrigger}
        aria-label={t('header_more_tabs')}
        aria-haspopup='menu'
        aria-expanded={open}
        aria-controls={open ? menuId : undefined}
        {...getReferenceProps()}
      >
        <span className={styles.tabOverflowDots} aria-hidden>
          ⋯
        </span>
      </button>
      {open && (
        <FloatingPortal>
          <FloatingFocusManager context={context} modal={false}>
            <div id={menuId} ref={refs.setFloating} className={styles.tabOverflowMenu} style={floatingStyles} role='menu' {...getFloatingProps()}>
              {items.map((item) => (
                <Link
                  key={item.id}
                  role='menuitem'
                  to={item.to}
                  className={cn(styles.tabOverflowMenuItem, item.selected && styles.tabOverflowMenuItemSelected)}
                  onClick={(e) => {
                    if (item.preventNavigation) e.preventDefault();
                    setOpen(false);
                  }}
                >
                  {item.label}
                </Link>
              ))}
            </div>
          </FloatingFocusManager>
        </FloatingPortal>
      )}
    </>
  );
}

type HeaderTabOverflowListProps = {
  items: HeaderTabItem[];
  trailing?: ReactNode;
  /** When true, wrap the main list in `.tabMenuRow` (community / user feed shell). */
  inTabMenuRow?: boolean;
  /** Extra classes on the visible `<ul>` (e.g. `tabMenuNoTopRule`). */
  listClassName?: string;
};

export function HeaderTabOverflowList({ items, trailing, inTabMenuRow, listClassName }: HeaderTabOverflowListProps) {
  const measureRef = useRef<HTMLUListElement>(null);
  const containerRef = useRef<HTMLUListElement>(null);
  const [visibleCount, setVisibleCount] = useState(items.length);

  useLayoutEffect(() => {
    setVisibleCount(items.length);
  }, [items]);

  useLayoutEffect(() => {
    const measureUl = measureRef.current;
    const mainUl = containerRef.current;
    if (!measureUl || !mainUl || items.length === 0) return;

    const recompute = () => {
      const measureLis = measureUl.querySelectorAll('li[data-tab-measure]');
      if (measureLis.length !== items.length) return;
      const widths = Array.from(measureLis).map((li) => li.getBoundingClientRect().width);
      const mainWidth = mainUl.getBoundingClientRect().width;
      if (mainWidth <= 0) return;

      const trailingLi = mainUl.querySelector('li[data-header-tab-trailing]');
      const trailingW = trailingLi ? trailingLi.getBoundingClientRect().width : 0;

      let best = 0;
      for (let k = items.length; k >= 0; k--) {
        const overflowCount = items.length - k;
        const sum = k === 0 ? 0 : widths.slice(0, k).reduce((a, b) => a + b, 0);
        const needMoreBtn = overflowCount > 0;
        const total = sum + trailingW + (needMoreBtn ? MORE_RESERVE_PX : 0);
        if (total <= mainWidth + 1) {
          best = k;
          break;
        }
      }
      setVisibleCount(best);
    };

    const ro = new ResizeObserver(recompute);
    ro.observe(mainUl);
    recompute();
    return () => ro.disconnect();
  }, [items]);

  const overflowItems = items.slice(visibleCount);
  const visibleItems = items.slice(0, visibleCount);

  const measureUl = (
    <ul className={cn(styles.tabMenu, styles.tabMenuOffscreenMeasure)} ref={measureRef} aria-hidden>
      {items.map((item) => (
        <li key={item.id} data-tab-measure className={item.selected ? styles.selected : styles.choice}>
          <Link to={item.to} tabIndex={-1} onClick={item.preventNavigation ? (e) => e.preventDefault() : undefined}>
            {item.label}
          </Link>
        </li>
      ))}
    </ul>
  );

  const mainUl = (
    <ul ref={containerRef} className={cn(styles.tabMenu, listClassName)}>
      {visibleItems.map((item) => (
        <li key={item.id} className={item.selected ? styles.selected : styles.choice}>
          <Link to={item.to} onClick={item.preventNavigation ? (e) => e.preventDefault() : undefined}>
            {item.label}
          </Link>
        </li>
      ))}
      {overflowItems.length > 0 ? (
        <li className={styles.choice}>
          <TabMoreMenu items={overflowItems} />
        </li>
      ) : null}
      {trailing}
    </ul>
  );

  return (
    <>
      {measureUl}
      {inTabMenuRow ? <div className={styles.tabMenuRow}>{mainUl}</div> : mainUl}
    </>
  );
}
