import { useState, ReactNode } from 'react';
import { useFloating, autoUpdate, offset, shift, useHover, useFocus, useDismiss, useRole, useInteractions, FloatingPortal } from '@floating-ui/react';
// Removed CSS modules import - converted to Tailwind classes

interface SpoilerTooltipProps {
  content: string;
  children: ReactNode;
  showTooltip?: boolean;
}

const SpoilerTooltip = ({ content, children, showTooltip = true }: SpoilerTooltipProps) => {
  const [isOpen, setIsOpen] = useState(false);

  const { refs, floatingStyles, context } = useFloating({
    open: isOpen,
    onOpenChange: setIsOpen,
    placement: 'top-start',
    whileElementsMounted: autoUpdate,
    middleware: [offset(7), shift()],
  });

  const hover = useHover(context, { move: false, delay: { open: 200, close: 0 } });
  const focus = useFocus(context);
  const dismiss = useDismiss(context);
  const role = useRole(context, { role: 'tooltip' });

  const { getReferenceProps, getFloatingProps } = useInteractions([hover, focus, dismiss, role]);

  return (
    <>
      <span ref={refs.setReference} {...getReferenceProps()}>
        {children}
      </span>
      {showTooltip && (
        <FloatingPortal>
          {isOpen && (
            <div
              className="absolute bg-white dark:bg-gray-900 text-gray-700 dark:text-gray-300 border border-gray-400 dark:border-gray-600 shadow-lg rounded text-xs leading-4 pointer-events-none py-1 px-1.5 z-[100000] font-verdana before:absolute before:content-[''] before:block before:left-0 before:h-0 before:ml-2 before:border-[9px] before:border-transparent before:border-t-gray-400 dark:before:border-t-gray-600 before:-bottom-[19px] after:absolute after:content-[''] after:block after:left-0 after:ml-2 after:-bottom-[18px] after:border-[9px] after:border-transparent after:border-t-white dark:after:border-t-gray-900"
              ref={refs.setFloating}
              style={floatingStyles}
              {...getFloatingProps()}
            >
              {content}
            </div>
          )}
        </FloatingPortal>
      )}
    </>
  );
};

export default SpoilerTooltip;
