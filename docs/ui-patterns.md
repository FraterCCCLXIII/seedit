# UI patterns (standard pages)

This app uses **shadcn/ui** primitives plus **CSS variables** from `src/themes.css`. Non-feed routes should share one layout contract so typography and padding stay aligned with the feed shell.

## Standard page content

Use **`StandardPageContent`** from `@/components/layout` for document-style views rendered inside the feed main column (`data-feed-shell="main"`):

- **`variant="full"`** — horizontal padding from `--page-content-padding-x` / `--page-content-padding-y`; full width of the main column. Use for feeds-adjacent pages: inbox, about, communities list, post thread, subplebbit settings, profile tab content.
- **`variant="narrow"`** — same padding plus `max-width: var(--page-content-max-width-narrow)` (48rem), centered. Use for form-heavy flows: general settings, account data editor (where appropriate).

Optional **`stack`** — adds `flex flex-col gap-4` between direct children.

Tokens live in `src/themes.css` (`--page-content-*`). The wrapper also sets shell-aligned **`font-size` / `line-height` / `font-family`** via `--feed-shell-*` so body text matches `FeedShellLayout` unless a subsection intentionally uses muted/smaller text.

## Settings

Prefer **`SettingsSection`** (`src/views/settings/settings-section.tsx`) and shadcn **`Card`** for grouped settings. Avoid duplicating `max-w-*` on inner tabs when the parent already wraps with `StandardPageContent variant="narrow"`.

## Legacy view CSS

Reserve **`*.module.css`** for layout that is awkward in Tailwind, not for redefining global text case. Prefer **`hsl(var(--shadcn-*))`** and Tailwind semantic classes (`text-muted-foreground`, `border-border`) over ad-hoc grays and `var(--text)`.

## CI: view CSS lowercase check

Run:

```bash
yarn check:view-css-lowercase
```

This fails if any `src/views/**/*.module.css` still uses `text-transform: lowercase` (intentional exceptions should be rare; prefer sentence case or inherited casing). The script uses `grep` so it does not require ripgrep.
