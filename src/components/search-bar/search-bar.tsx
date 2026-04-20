import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useLocation, useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { autoUpdate, FloatingPortal, offset, shift, useFloating } from '@floating-ui/react';
import { PixelIcon } from '@/components/ui/pixel-icon';
import { useAccount } from '@bitsocialnet/bitsocial-react-hooks';
import Plebbit from '@plebbit/plebbit-js';
import {
  isHomeAboutView,
  isPostPageAboutView,
  isSubplebbitAboutView,
} from '../../lib/utils/view-utils';
import { Select } from '@/components/ui/select';
import { cn } from '@/lib/utils';
import { useDefaultSubplebbitAddresses } from '../../hooks/use-default-subplebbits';
import styles from './search-bar.module.css';

const SEARCH_SCOPES = ['posts', 'users', 'communities'] as const;
type SearchScope = (typeof SEARCH_SCOPES)[number];

const SEARCH_SCOPE_STORAGE_KEY = 'seedit-search-scope';

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

  const [searchScope, setSearchScope] = useState<SearchScope>(() => {
    try {
      const stored = sessionStorage.getItem(SEARCH_SCOPE_STORAGE_KEY);
      if (stored === 'posts' || stored === 'users' || stored === 'communities') return stored;
    } catch {
      /* ignore */
    }
    return 'posts';
  });

  const [inputValue, setInputValue] = useState('');
  const searchBarRef = useRef<HTMLFormElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);

  const account = useAccount();
  const subplebbitAddresses = useMemo(() => account?.subscriptions || [], [account?.subscriptions]);
  const defaultSubplebbitAddresses = useDefaultSubplebbitAddresses();
  const [isInputFocused, setIsInputFocused] = useState(false);
  const [activeDropdownIndex, setActiveDropdownIndex] = useState<number>(-1);

  useEffect(() => {
    const q = searchParams.get('q');
    if (isSearchPage) {
      setInputValue(q || '');
      const tab = searchParams.get('tab');
      if (tab === 'posts' || tab === 'users' || tab === 'communities') {
        setSearchScope(tab);
      }
    } else if (q) {
      setInputValue(q);
    }
  }, [isSearchPage, searchParams]);

  const filteredCommunitySuggestions = useMemo(() => {
    if (!inputValue.trim() || searchScope !== 'communities') return [];
    const combinedAddresses = Array.from(new Set([...subplebbitAddresses, ...defaultSubplebbitAddresses]));
    return combinedAddresses.filter((address: string) => address?.toLowerCase()?.includes(inputValue.toLowerCase())).slice(0, 10);
  }, [inputValue, subplebbitAddresses, defaultSubplebbitAddresses, searchScope]);

  const { x, y, strategy, refs, context } = useFloating({
    open: isInputFocused && filteredCommunitySuggestions.length > 0,
    onOpenChange: (open) => {
      if (!open) {
        setIsInputFocused(false);
      }
    },
    middleware: [offset(5), shift()],
    whileElementsMounted: autoUpdate,
  });

  useEffect(() => {
    if (isFocused) {
      searchInputRef.current?.focus();
    }
  }, [isFocused]);

  const persistScope = useCallback((scope: SearchScope) => {
    setSearchScope(scope);
    try {
      sessionStorage.setItem(SEARCH_SCOPE_STORAGE_KEY, scope);
    } catch {
      /* ignore */
    }
  }, []);

  const handleSearchSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const q = searchInputRef.current?.value?.trim() ?? '';
    if (!q) return;
    navigate(`/search?q=${encodeURIComponent(q)}&tab=${searchScope}`);
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setInputValue(value);
    setActiveDropdownIndex(-1);
  };

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

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === 'Escape') {
        setIsInputFocused(false);
        setActiveDropdownIndex(-1);
        return;
      }

      const dropdownActive = isInputFocused && searchScope === 'communities' && filteredCommunitySuggestions.length > 0;
      if (!dropdownActive) {
        return;
      }

      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setActiveDropdownIndex((prevIndex) => (prevIndex < filteredCommunitySuggestions.length - 1 ? prevIndex + 1 : prevIndex));
        return;
      }
      if (e.key === 'ArrowUp') {
        e.preventDefault();
        setActiveDropdownIndex((prevIndex) => (prevIndex > 0 ? prevIndex - 1 : 0));
        return;
      }
      if (e.key === 'Enter') {
        e.preventDefault();
        if (activeDropdownIndex !== -1 && filteredCommunitySuggestions[activeDropdownIndex]) {
          handleCommunitySelect(filteredCommunitySuggestions[activeDropdownIndex]);
        } else if (inputValue.trim()) {
          searchBarRef.current?.requestSubmit();
        }
      }
    },
    [isInputFocused, searchScope, filteredCommunitySuggestions, activeDropdownIndex, handleCommunitySelect, inputValue],
  );

  return (
    <div ref={wrapperRef} className={`${styles.searchBarWrapper} ${isInHomeAboutView || isInSubplebbitAboutView || isInPostPageAboutView ? styles.mobileInfobar : ''}`}>
      <form className={styles.searchBarForm} ref={searchBarRef} onSubmit={handleSearchSubmit}>
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
            refs.setReference(instance);
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
          <PixelIcon glyph='search' className='text-xl' aria-hidden />
        </button>
      </form>
      {context.open && (
        <FloatingPortal>
          <ul
            ref={refs.setFloating}
            style={{
              position: strategy,
              top: y ?? 0,
              left: x ?? 0,
              width: searchInputRef.current?.offsetWidth ? searchInputRef.current.offsetWidth : 'auto',
            }}
            className='z-[9999] max-h-60 list-none overflow-auto rounded-control border border-border bg-popover p-1 text-popover-foreground shadow-[0_0_0_1px_rgba(255,255,255,0.08)] dark:shadow-[0_0_0_1px_rgba(255,255,255,0.12)]'
          >
            {filteredCommunitySuggestions.map((address: string, index: number) => (
              <li
                key={address}
                className={cn(
                  'cursor-pointer rounded-control px-2 py-1.5 text-sm text-foreground outline-none hover:bg-accent hover:text-accent-foreground',
                  index === activeDropdownIndex && 'bg-accent text-accent-foreground',
                )}
                onClick={() => handleCommunitySelect(address)}
                onTouchEnd={() => handleCommunitySelect(address)}
                onMouseEnter={() => setActiveDropdownIndex(index)}
              >
                {Plebbit.getShortAddress({ address })}
              </li>
            ))}
          </ul>
        </FloatingPortal>
      )}
      <div className={styles.searchModes}>
        <div className={styles.searchModesInner}>
          <label htmlFor='sidebar-search-scope' className={styles.searchScopeLabel}>
            {t('search_scope_label')}
          </label>
          <Select
            id='sidebar-search-scope'
            value={searchScope}
            onChange={(e) => persistScope(e.target.value as SearchScope)}
            aria-label={t('search_scope_label')}
          >
            <option value='posts'>{t('search_scope_posts')}</option>
            <option value='users'>{t('search_scope_users')}</option>
            <option value='communities'>{t('search_scope_communities')}</option>
          </Select>
        </div>
      </div>
    </div>
  );
};

export default SearchBar;
