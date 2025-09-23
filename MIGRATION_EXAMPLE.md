# CSS Modules to Tailwind/shadcn/ui Migration Guide

## Current CSS Modules Approach (❌ Old Way)

```tsx
// sidebar.tsx
import styles from './sidebar.module.css';

<div className={styles.largeButton}>
  {t('submit_post')}
  <div className={styles.nub} />
</div>
```

```css
/* sidebar.module.css */
.largeButton {
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue', sans-serif;
  text-align: center;
  position: relative;
  border: 1px solid var(--button-border-primary);
  background: var(--background) none repeat-x scroll center left;
  background-image: var(--button-large);
  background-repeat: repeat;
  font-size: 150%;
  font-weight: bold;
  letter-spacing: -1px;
  line-height: 29px;
  height: 29px;
  cursor: pointer;
  margin-bottom: 12px;
  color: var(--text-primary);
  margin-right: -5px;
}

.nub {
  position: absolute;
  top: -1px;
  right: -1px;
  height: 31px;
  width: 24px;
  background: var(--background) none no-repeat scroll center left;
  background-image: var(--button-large-nub);
  background-repeat: no-repeat;
}
```

## New Tailwind/shadcn/ui Approach (✅ Modern Way)

```tsx
// sidebar.tsx
import { Button } from '@/components/ui/button';

<Button variant="submit" size="submit" className="w-full mb-3">
  {t('submit_post')}
</Button>
```

```tsx
// components/ui/button.tsx
const buttonVariants = cva(
  'inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0',
  {
    variants: {
      variant: {
        submit: 'bg-gradient-to-r from-blue-500 to-blue-600 text-white hover:from-blue-600 hover:to-blue-700 border border-blue-400 font-bold text-lg tracking-tight shadow-lg hover:shadow-xl transition-all duration-200 hover:-translate-y-0.5',
      },
      size: {
        submit: 'h-8 px-6 py-1 text-base font-bold',
      },
    },
  },
);
```

## Benefits of Migration

1. **No More CSS Modules**: No more generated hashes like `8tu8t_104`
2. **Consistent Design System**: All buttons use the same component
3. **Better Developer Experience**: IntelliSense, better debugging
4. **Smaller Bundle**: Tree-shaking removes unused styles
5. **Maintainable**: All styles in one place, easy to update
6. **Modern**: Industry standard approach

## Migration Steps

1. ✅ **Audit CSS Modules** - Found 61 files using CSS Modules
2. ✅ **Create shadcn/ui variants** - Added `submit` variant and size
3. 🔄 **Migrate components** - Replace `styles.largeButton` with `<Button variant="submit">`
4. ⏳ **Update all components** - Replace CSS Modules with Tailwind classes
5. ⏳ **Remove CSS Modules** - Delete unused `.module.css` files

## Next Steps

1. Replace all `styles.largeButton` usage with `<Button variant="submit" size="submit">`
2. Remove the `nub` div (no longer needed with modern design)
3. Update other CSS Modules components to use Tailwind classes
4. Delete unused CSS Modules files
5. Remove CSS Modules overrides from `index.css`
