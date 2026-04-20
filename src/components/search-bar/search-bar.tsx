import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { useLocation, useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { autoUpdate, FloatingPortal, flip, offset, shift, size, useFloating } from '@floating-ui/react';
import { PixelIcon } from '@/components/ui/pixel-icon';
import { useAccount } from '@bitsocialnet/bitsocial-react-hooks';
import Plebbit from '@plebbit/plebbit-js';
import {
  isHomeAboutView,
  isPostPageAboutView,
  isSubplebbitAboutView,
} from '../../lib/utils/view-utils';
import { cn } from '@/lib/utils';
import { useDefaultSubplebbitAddresses } from '../../hooks/use-default-subplebbits';
import styles from './search-bar.module.css';

type DropdownItem =
  | { kind: 'community'; key: string; address: string; label: string }
  | { kind: 'posts'; key: string }
  | { kind: 'user'; key: string };

interface SearchBarProps {
  isFocused?: boolean;
}

const SearchBar = ({ isFocused = false }: SearchBarProps) => {
  const { t } = useTranslation();
  const location = useLocation();
  const navigate = useNavigate();
  const params = useParams();
  const [searchParams] = useSearchParams();

  const isInHomeAboutView = isHomeAboutView(location.pathname);
  const isInPostPageAboutView = isPostPageAboutView(location.pathname, params);
  const isInSubplebbitAboutView = isSubplebbitAboutView(location.pathname, params);
  const isSearchPage = location.pathname === '/search';

  const [inputValue, setInputValue] = useState('');
  const searchBarRef = useRef<HTMLFormElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const suggestionsListRef = useRef<HTMLUListElement | null>(null);

  const account = useAccount();
  const subplebbitAddresses = useMemo(() => account?.subscriptions || [], [account?.subscriptions]);
  const defaultSubplebbitAddresses = useDefaultSubplebbitAddresses();
  const [isInputFocused, setIsInputFocused] = useState(false);
  const [activeDropdownIndex, setActiveDropdownIndex] = useState<number>(-1);

  const trimmedQuery = inputValue.trim();
  const showDropdown = isInputFocused && trimmedQuery.length > 0;

  const dropdownItems = useMemo((): DropdownItem[] => {
    if (!trimmedQuery) return [];
    const qLower = trimmedQuery.toLowerCase();
    const combinedAddresses = Array.from(new Set([...subplebbitAddresses, ...defaultSubplebbitAddresses]));
    const communities = combinedAddresses
      .filter((address: string) => address?.toLowerCase()?.includes(qLower))
      .slice(0, 8)
      .map((address) => ({
        kind: 'community' as const,
        key: `c:${address}`,
        address,
        label: Plebbit.getShortAddress({ address }),
      }));

    return [
      ...communities,
      { kind: 'posts' as const, key: 'action:posts' },
      { kind: 'user' as const, key: 'action:user' },
    ];
  }, [trimmedQuery, subplebbitAddresses, defaultSubplebbitAddresses]);

  const { x, y, strategy, refs, context } = useFloating({
    placement: 'bottom-start',
    open: showDropdown && dropdownItems.length > 0,
    onOpenChange: (open) => {
      if (!open) {
        setIsInputFocused(false);
      }
    },
    middleware: [
      offset(6),
      flip({ padding: 12, fallbackPlacements: ['top-start'] }),
      shift({ padding: 8, crossAxis: true }),
      size({
        apply({ rects, elements }) {
          Object.assign(elements.floating.style, {
            width: `${Math.round(rects.reference.width)}px`,
          });
        },
      }),
    ],
    whileElementsMounted: autoUpdate,
  });

  useEffect(() => {
    const q = searchParams.get('q');
    if (isSearchPage) {
      setInputValue(q || '');
    } else if (q) {
      setInputValue(q);
    }
  }, [isSearchPage, searchParams]);

  useEffect(() => {
    if (isFocused) {
      searchInputRef.current?.focus();
    }
  }, [isFocused]);

  useLayoutEffect(() => {
    if (!context.open || activeDropdownIndex < 0) return;
    const root = suggestionsListRef.current;
    if (!root) return;
    const el = root.querySelector(`[data-search-suggestion-index="${activeDropdownIndex}"]`);
    el?.scrollIntoView({ block: 'nearest', inline: 'nearest' });
  }, [activeDropdownIndex, context.open, dropdownItems]);

  const handleCommunitySelect = useCallback(
    (address: string) => {
      if (address.toLowerCase() === params.subplebbitAddress?.toLowerCase()) {
        alert(t('already_in_community'));
        return;
      }
      setInputValue('');
      setIsInputFocused(false);
      setActiveDropdownIndex(-1);
      searchInputRef.current?.blur();
      navigate(`/s/${address}`);
    },
    [navigate, params.subplebbitAddress, t],
  );

  const applyDropdownItem = useCallback(
    (item: DropdownItem) => {
      const q = trimmedQuery;
      if (!q) return;
      if (item.kind === 'community') {
        handleCommunitySelect(item.address);
        return;
      }
      setIsInputFocused(false);
      setActiveDropdownIndex(-1);
      searchInputRef.current?.blur();
      if (item.kind === 'posts') {
        navigate(`/search?q=${encodeURIComponent(q)}&tab=posts`);
        return;
      }
      navigate(`/u/${encodeURIComponent(q)}`);
    },
    [trimmedQuery, navigate, handleCommunitySelect],
  );

  const handleSearchSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const q = searchInputRef.current?.value?.trim() ?? '';
    if (!q) return;
    navigate(`/search?q=${encodeURIComponent(q)}&tab=posts`);
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setInputValue(value);
    setActiveDropdownIndex(-1);
  };

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === 'Escape') {
        setIsInputFocused(false);
        setActiveDropdownIndex(-1);
        return;
      }

      const dropdownActive = showDropdown && dropdownItems.length > 0;
      if (!dropdownActive) {
        return;
      }

      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setActiveDropdownIndex((prevIndex) => (prevIndex < dropdownItems.length - 1 ? prevIndex + 1 : prevIndex));
        return;
      }
      if (e.key === 'ArrowUp') {
        e.preventDefault();
        setActiveDropdownIndex((prevIndex) => (prevIndex > 0 ? prevIndex - 1 : 0));
        return;
      }
      if (e.key === 'Enter') {
        e.preventDefault();
        if (activeDropdownIndex !== -1 && dropdownItems[activeDropdownIndex]) {
          applyDropdownItem(dropdownItems[activeDropdownIndex]);
        } else if (trimmedQuery) {
          searchBarRef.current?.requestSubmit();
        }
      }
    },
    [showDropdown, dropdownItems, activeDropdownIndex, applyDropdownItem, trimmedQuery],
  );

  return (
    <div ref={wrapperRef} className={`${styles.searchBarWrapper} ${isInHomeAboutView || isInSubplebbitAboutView || isInPostPageAboutView ? styles.mobileInfobar : ''}`}>
      <form
        className={styles.searchBarForm}
        ref={(el) => {
          searchBarRef.current = el;
          refs.setReference(el);
        }}
        onSubmit={handleSearchSubmit}
      >
        <input
          type='text'
          autoCorrect='off'
          autoComplete='off'
          spellCheck='false'
          autoCapitalize='off'
          placeholder={t('search_placeholder')}
          className={styles.searchInput}
          ref={(instance) => {
            searchInputRef.current = instance;
          }}
          onFocus={() => {
            setIsInputFocused(true);
          }}
          onChange={handleSearchChange}
          value={inputValue}
          onKeyDown={handleKeyDown}
          onBlur={() => setTimeout(() => setIsInputFocused(false), 150)}
        />
        <button type='submit' className={styles.searchSubmit} aria-label={t('search')}>
          <PixelIcon glyph='search' className={styles.searchSubmitIcon} aria-hidden />
        </button>
      </form>
      {context.open && (
        <FloatingPortal>
          <ul
            ref={(node) => {
              suggestionsListRef.current = node;
              refs.setFloating(node);
            }}
            style={{
              position: strategy,
              top: y ?? 0,
              left: x ?? 0,
            }}
            className={styles.suggestionsList}
            role='listbox'
            aria-label={t('search')}
            onPointerDown={(e) => e.preventDefault()}
          >
            {dropdownItems.map((item, index) => {
              const isActive = index === activeDropdownIndex;
              const secondary =
                item.kind === 'community'
                  ? item.address
                  : item.kind === 'posts'
                    ? t('search_results_for', { query: trimmedQuery })
                    : trimmedQuery.length > 36
                      ? `${trimmedQuery.slice(0, 34)}…`
                      : trimmedQuery;

              return (
                <li
                  key={item.key}
                  data-search-suggestion-index={index}
                  role='option'
                  aria-selected={isActive}
                  className={cn(
                    styles.suggestionItem,
                    isActive && styles.suggestionItemActive,
                  )}
                  onClick={() => applyDropdownItem(item)}
                  onTouchEnd={() => applyDropdownItem(item)}
                  onMouseEnter={() => setActiveDropdownIndex(index)}
                >
                  <div className={styles.suggestionPrimary}>
                    {item.kind === 'community' ? (
                      <>
                        <span className={styles.suggestionKind}>{t('search_scope_communities')}</span>
                        <span className={styles.suggestionSep}>·</span>
                        <span>{item.label}</span>
                      </>
                    ) : item.kind === 'posts' ? (
                      t('search_scope_posts')
                    ) : (
                      t('search_users_view_profile')
                    )}
                  </div>
                  <div className={styles.suggestionSecondary}>{secondary}</div>
                </li>
              );
            })}
          </ul>
        </FloatingPortal>
      )}
    </div>
  );
};

export default SearchBar;
