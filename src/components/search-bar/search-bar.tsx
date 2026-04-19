import { useCallback, useEffect, useRef, useState, useMemo } from 'react';
import { useLocation, useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useFloating, autoUpdate, offset, shift, FloatingPortal } from '@floating-ui/react';
import { Search } from 'lucide-react';
import { useAccount } from '@bitsocialnet/bitsocial-react-hooks';
import Plebbit from '@plebbit/plebbit-js';
import {
  isHomeView,
  isHomeAboutView,
  isPostPageView,
  isPostPageAboutView,
  isSubplebbitView,
  isAllView,
  isModView,
  isSubplebbitAboutView,
} from '../../lib/utils/view-utils';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';
import useFeedFiltersStore from '../../stores/use-feed-filters-store';
import { useDefaultSubplebbitAddresses } from '../../hooks/use-default-subplebbits';
import styles from './search-bar.module.css';
import _ from 'lodash';

interface SearchBarProps {
  isFocused?: boolean;
}

const SearchBar = ({ isFocused = false }: SearchBarProps) => {
  const { t } = useTranslation();
  const location = useLocation();
  const navigate = useNavigate();
  const params = useParams();
  const [searchParams, setSearchParams] = useSearchParams();

  const isInHomeAboutView = isHomeAboutView(location.pathname);
  const isInPostPageAboutView = isPostPageAboutView(location.pathname, params);
  const isInSubplebbitView = isSubplebbitView(location.pathname, params);
  const isInSubplebbitAboutView = isSubplebbitAboutView(location.pathname, params);
  const isInHomeView = isHomeView(location.pathname);
  const isInPostPageView = isPostPageView(location.pathname, params);
  const isInAllView = isAllView(location.pathname);
  const isInModView = isModView(location.pathname);

  const isInFeedView = (isInSubplebbitView || isInHomeView || isInAllView || isInModView) && !isInPostPageView;

  const currentQuery = searchParams.get('q') || '';
  const [isInCommunitySearch, setIsInCommunitySearch] = useState(() => {
    if (currentQuery) return true;
    if (isInFeedView) return false;
    return false;
  });
  const placeholder = isInCommunitySearch && isInFeedView ? t('search_posts') : t('enter_community_address');

  const searchBarRef = useRef<HTMLFormElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);

  const [inputValue, setInputValue] = useState(currentQuery);
  const { setIsSearching } = useFeedFiltersStore();

  const account = useAccount();
  const subplebbitAddresses = useMemo(() => account?.subscriptions || [], [account?.subscriptions]);
  const defaultSubplebbitAddresses = useDefaultSubplebbitAddresses();
  const [isInputFocused, setIsInputFocused] = useState(false);
  const [activeDropdownIndex, setActiveDropdownIndex] = useState<number>(-1);

  const filteredCommunitySuggestions = useMemo(() => {
    if (!inputValue || isInCommunitySearch) return [];
    const combinedAddresses = Array.from(new Set([...subplebbitAddresses, ...defaultSubplebbitAddresses]));
    return combinedAddresses.filter((address: string) => address?.toLowerCase()?.includes(inputValue.toLowerCase())).slice(0, 10);
  }, [inputValue, subplebbitAddresses, defaultSubplebbitAddresses, isInCommunitySearch]);

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
    setInputValue(searchParams.get('q') || '');
  }, [searchParams]);

  const debouncedSetSearchQuery = useCallback(
    _.debounce((query: string) => {
      if (isInCommunitySearch) {
        setSearchParams((prev) => {
          if (query.trim()) {
            prev.set('q', query.trim());
          } else {
            prev.delete('q');
          }
          return prev;
        });
        setIsSearching(false);
      }
    }, 300),
    [setSearchParams, setIsSearching, isInCommunitySearch],
  );

  useEffect(() => {
    if (searchParams.get('q')) {
      setIsInCommunitySearch(true);
    } else if (!isInFeedView) {
      setIsInCommunitySearch(false);
    }
  }, [searchParams, isInFeedView]);

  useEffect(() => {
    if (isFocused) {
      searchInputRef.current?.focus();
    }
  }, [isFocused]);

  const handleSearchSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (isInCommunitySearch) {
      debouncedSetSearchQuery.flush();
      return;
    }
    const searchInput = searchInputRef.current?.value;
    if (searchInput) {
      if (searchInput.toLowerCase() === params.subplebbitAddress?.toLowerCase()) {
        alert(t('already_in_community'));
        return;
      }
      setInputValue('');
      navigate(`/s/${searchInput}`);
    }
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setInputValue(value);
    setActiveDropdownIndex(-1);
    if (isInCommunitySearch) {
      if (value.trim()) {
        setIsSearching(true);
      }
      debouncedSetSearchQuery(value);
    }
  };

  const handleCommunitySearchToggle = (shouldSearchCommunity: boolean) => {
    setIsInCommunitySearch(shouldSearchCommunity);
    if (!shouldSearchCommunity) {
      setInputValue('');
      setIsSearching(false);
      setSearchParams((prev) => {
        prev.delete('q');
        return prev;
      });
    } else {
      searchInputRef.current?.focus();
    }
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
    [navigate, setInputValue, setIsInputFocused, setActiveDropdownIndex, params.subplebbitAddress, t],
  );

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (!isInputFocused || isInCommunitySearch || filteredCommunitySuggestions.length === 0) {
        if (e.key === 'Enter' && !isInCommunitySearch) {
        } else {
          return;
        }
      }

      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setActiveDropdownIndex((prevIndex) => (prevIndex < filteredCommunitySuggestions.length - 1 ? prevIndex + 1 : prevIndex));
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setActiveDropdownIndex((prevIndex) => (prevIndex > 0 ? prevIndex - 1 : 0));
      } else if (e.key === 'Enter') {
        e.preventDefault();
        if (activeDropdownIndex !== -1 && filteredCommunitySuggestions[activeDropdownIndex]) {
          handleCommunitySelect(filteredCommunitySuggestions[activeDropdownIndex]);
        } else if (inputValue.trim() && !isInCommunitySearch) {
          searchBarRef.current?.requestSubmit();
        }
      } else if (e.key === 'Escape') {
        setIsInputFocused(false);
        setActiveDropdownIndex(-1);
      }
    },
    [isInputFocused, isInCommunitySearch, filteredCommunitySuggestions, activeDropdownIndex, handleCommunitySelect, inputValue],
  );

  return (
    <div ref={wrapperRef} className={`${styles.searchBarWrapper} ${isInHomeAboutView || isInSubplebbitAboutView || isInPostPageAboutView ? styles.mobileInfobar : ''}`}>
      <form
        className={cn(
          'flex w-full min-w-0 max-w-full items-stretch overflow-hidden rounded-md border border-input bg-background shadow-sm transition-[box-shadow] focus-within:ring-1 focus-within:ring-ring',
          styles.searchBarForm,
        )}
        ref={searchBarRef}
        onSubmit={handleSearchSubmit}
      >
        <Input
          variant='grouped'
          type='text'
          autoCorrect='off'
          autoComplete='off'
          spellCheck='false'
          autoCapitalize='off'
          placeholder={placeholder}
          className={cn('min-w-0', styles.searchTextInput)}
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
        <Button
          type='submit'
          variant='ghost'
          size='icon'
          className='h-9 min-h-9 w-9 shrink-0 rounded-none border-l border-input text-muted-foreground hover:bg-accent hover:text-accent-foreground'
          aria-label={t('search')}
        >
          <Search className='h-4 w-4' strokeWidth={2} aria-hidden />
        </Button>
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
            className='z-[9999] max-h-60 list-none overflow-auto rounded-md border border-border bg-popover p-1 text-popover-foreground shadow-md'
          >
            {filteredCommunitySuggestions.map((address: string, index: number) => (
              <li
                key={address}
                className={cn(
                  'cursor-pointer rounded-sm px-2 py-1.5 text-sm text-foreground outline-none hover:bg-accent hover:text-accent-foreground',
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
      <Card className='mt-3 border-border/80 bg-muted/20 shadow-sm'>
        <div className='space-y-3 p-3.5'>
          <div className='flex items-start gap-3'>
            <Checkbox
              id='sidebar-search-go-community'
              checked={!isInCommunitySearch || !isInFeedView}
              disabled={!isInFeedView}
              onChange={() => handleCommunitySearchToggle(false)}
              className='mt-0.5'
            />
            <Label
              htmlFor='sidebar-search-go-community'
              className={cn('cursor-pointer text-sm font-normal leading-snug', !isInFeedView && 'cursor-not-allowed text-muted-foreground')}
            >
              {t('go_to_a_community')}
            </Label>
          </div>
          {isInFeedView && (
            <div className='flex items-start gap-3 border-t border-border pt-3'>
              <Checkbox id='sidebar-search-feed' checked={isInCommunitySearch} onChange={() => handleCommunitySearchToggle(true)} className='mt-0.5' />
              <Label htmlFor='sidebar-search-feed' className='cursor-pointer text-sm font-normal leading-snug'>
                {t('search_feed_post')}
              </Label>
            </div>
          )}
        </div>
      </Card>
    </div>
  );
};

export default SearchBar;
