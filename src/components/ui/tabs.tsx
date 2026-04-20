import * as React from 'react';
import { cn } from '@/lib/utils';

type TabsContextValue = {
  value: string;
  onValueChange: (value: string) => void;
};

const TabsContext = React.createContext<TabsContextValue | null>(null);

function useTabsContext() {
  const ctx = React.useContext(TabsContext);
  if (!ctx) throw new Error('Tabs components must be used within <Tabs>');
  return ctx;
}

type TabsProps = Omit<React.ComponentProps<'div'>, 'onChange'> & {
  value?: string;
  defaultValue?: string;
  onValueChange?: (value: string) => void;
};

const Tabs = ({ value, defaultValue = '', onValueChange, className, children, ...props }: TabsProps) => {
  const [uncontrolled, setUncontrolled] = React.useState(defaultValue);
  const isControlled = value !== undefined;
  const currentValue = isControlled ? value : uncontrolled;

  const handleChange = React.useCallback(
    (next: string) => {
      if (!isControlled) setUncontrolled(next);
      onValueChange?.(next);
    },
    [isControlled, onValueChange],
  );

  const ctx = React.useMemo(() => ({ value: currentValue, onValueChange: handleChange }), [currentValue, handleChange]);

  return (
    <TabsContext.Provider value={ctx}>
      <div className={cn('w-full', className)} {...props}>
        {children}
      </div>
    </TabsContext.Provider>
  );
};

const TabsList = React.forwardRef<HTMLDivElement, React.ComponentProps<'div'>>(({ className, ...props }, ref) => (
  <div ref={ref} role='tablist' className={cn('inline-flex h-9 items-center justify-center rounded-control bg-muted p-1 text-muted-foreground', className)} {...props} />
));
TabsList.displayName = 'TabsList';

const TabsTrigger = React.forwardRef<HTMLButtonElement, React.ComponentProps<'button'> & { value: string }>(
  ({ className, value: triggerValue, disabled, onClick, ...props }, ref) => {
    const { value: selected, onValueChange } = useTabsContext();
    const isActive = selected === triggerValue;

    return (
      <button
        ref={ref}
        type='button'
        role='tab'
        aria-selected={isActive}
        disabled={disabled}
        data-state={isActive ? 'active' : 'inactive'}
        className={cn(
          'inline-flex items-center justify-center whitespace-nowrap rounded-control px-3 py-1 text-sm font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm',
          className,
        )}
        onClick={(e) => {
          onClick?.(e);
          if (!disabled && !e.defaultPrevented) onValueChange(triggerValue);
        }}
        {...props}
      />
    );
  },
);
TabsTrigger.displayName = 'TabsTrigger';

const TabsContent = React.forwardRef<HTMLDivElement, React.ComponentProps<'div'> & { value: string }>(({ className, value: contentValue, ...props }, ref) => {
  const { value: selected } = useTabsContext();
  if (selected !== contentValue) return null;
  return (
    <div
      ref={ref}
      role='tabpanel'
      className={cn('mt-2 ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2', className)}
      {...props}
    />
  );
});
TabsContent.displayName = 'TabsContent';

export { Tabs, TabsList, TabsTrigger, TabsContent };
