import { useCallback, useEffect, useRef, useState, useMemo } from 'react';
import { useLocation, useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useFloating, autoUpdate, offset, shift, FloatingPortal } from '@floating-ui/react';
import { useAccount } from '@plebbit/plebbit-react-hooks';
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
import useFeedFiltersStore from '../../stores/use-feed-filters-store';
import { useDefaultSubplebbitAddresses } from '../../hooks/use-default-subplebbits';
// Removed CSS modules import - converted to Tailwind classes
import _ from 'lodash';

interface SearchBarProps {
  isFocused?: boolean;
  onExpandoChange?: (expanded: boolean) => void;
}

const SearchBar = ({ isFocused = false, onExpandoChange }: SearchBarProps) => {
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
    if (!!currentQuery) return true;
    if (isInFeedView) return false;
    return false; // always default to 'go to a community' in non-feed views
  });
  const placeholder = isInCommunitySearch && isInFeedView ? t('search_posts') : t('enter_community_address');
  const [showExpando, setShowExpando] = useState(false);

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

  // eslint-disable-next-line react-hooks/exhaustive-deps
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
    if (!!searchParams.get('q')) {
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

  const handleClickOutside = useCallback(
    (event: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setShowExpando(false);
      }
    },
    [wrapperRef],
  );

  useEffect(() => {
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [handleClickOutside]);

  const handleSearchSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (isInCommunitySearch) {
      debouncedSetSearchQuery.flush();
      return;
    }
    const searchInput = searchInputRef.current?.value;
    if (searchInput) {
      setInputValue('');
      navigate(`/p/${searchInput}`);
    }
  };

  useEffect(() => {
    onExpandoChange?.(showExpando);
  }, [showExpando, onExpandoChange]);

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
      setShowExpando(true);
    }
  };

  const handleCommunitySelect = useCallback(
    (address: string) => {
      setInputValue('');
      setIsInputFocused(false);
      setActiveDropdownIndex(-1);
      setShowExpando(false);
      searchInputRef.current?.blur();
      navigate(`/p/${address}`);
    },
    [navigate, setInputValue, setIsInputFocused, setActiveDropdownIndex],
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
    <div
      ref={wrapperRef}
      className={`relative transition-transform duration-300 ease-linear ${isInHomeAboutView || isInSubplebbitAboutView || isInPostPageAboutView ? 'sm:w-full' : ''}`}
    >
      <form className='relative z-[2] min-w-[300px]' ref={searchBarRef} onSubmit={handleSearchSubmit}>
        <input
          type='text'
          autoCorrect='off'
          autoComplete='off'
          spellCheck='false'
          autoCapitalize='off'
          placeholder={placeholder}
          className='relative border border-gray-500 bg-white dark:bg-gray-900 text-gray-700 dark:text-gray-300 text-xs font-verdana w-full box-border py-1.5 pr-6 pl-2 lowercase'
          ref={(instance) => {
            // @ts-expect-error Property 'current' is read-only.
            searchInputRef.current = instance;
            refs.setReference(instance);
          }}
          onFocus={() => {
            setShowExpando(true);
            setIsInputFocused(true);
          }}
          onChange={handleSearchChange}
          value={inputValue}
          onKeyDown={handleKeyDown}
          onBlur={() => setTimeout(() => setIsInputFocused(false), 150)}
        />
        <input
          type='submit'
          value=''
          className="bg-transparent bg-[url('data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABoAAAAaCAMAAACelLz8AAAAb1BMVEUAAACJiYmJiYmJiYmJiYmJiYmJiYmJiYmJiYmJiYmJiYmJiYmJiYmJiYmJiYmJiYmJiYmJiYmJiYmJiYmJiYmJiYmJiYmJiYmJiYmJiYmJiYmJiYmJiYmJiYmJiYmJiYmJiYmJiYmJiYmJiYmJiYm4Po3NAAAAJXRSTlMAAQIEDBAREhMUJS0uQ09QV19hZG1udHmbnJ64xMXGx8jOz9DUayO31AAAANNJREFUeAGF0fFugjAUhfGDg3W1blMEC2IV8Lz/My4nEnK7jOz3380nN7XFy0fdJzL1tUeujBMXUyxh7Acaw96UBzPj2sqBmtuDc6Edqe+0U6Km/v01VJ2muJxtUnnDYqc2e0itbRVWlXbWkJ5kC6MleYUkkgcYgWSCkKSD4Uiy+CdpYfi98Pb3MRqS3fbhzxA/61e77C8/vbmorrIXdcmvtwnOhWaknNZH0Zw7mqfcbGWcuXheTqaJr6+JvHVnDxzzJkUBUZNvZGy7Y7PZZH097p8/V4YmEaKXKKIAAAAASUVORK5CYII=')] bg-[length:13px_13px] bg-[position:0_0] h-3.5 w-3.5 border-0 absolute top-2 right-2 cursor-pointer text-[0px] hover:bg-[url('data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABoAAAAaCAMAAACelLz8AAAAeFBMVEUAAACJiYmJiYmJiYmJiYmJiYmJiYmJiYmJiYmJiYmJiYmJiYmJiYmJiYmJiYmJiYmJiYmJiYmJiYmJiYmJiYmJiYmJiYmJiYmJiYmJiYmJiYmJiYmJiYmJiYmJiYmJiYmJiYmJiYmJiYmJiYmJiYmJiYmJiYmJiYl3r/6iAAAAJ3RSTlMAAQMFDhMUFhcYLC02N1FfYGlydXiDhIuRuru8vt3s7e7v8PH4+fpBQVyrAAAA1ElEQVR4AYXQcW+CMBBA8cPBuk7cpgiCiFUE3/f/hksuDbmakf3+uuSl5DhR8lH1AUJfeUnl7UQ0tbktnwPGsDXlTuKxtFzfjM3OubIZ9V0eUwvQv4sqOoA27jYB/ZtEmw6Yvc4VMBayKEag0rEHGjEa4KJTAHY2lUDQCcDZ5ACyf1IAytcPXv9eowbO68sfdfQz0G2SX356c6iusIc6peetS+fKegTgINH2wav90ob1lrcz0fN0SJv46hLgej56kb1pUZaJiu1HUqbdZLXZZH3fb1+/i3YpBcVhtqwAAAAASUVORK5CYII=')] hover:cursor-pointer"
        />
      </form>
      {context.open && (
        <FloatingPortal>
          <ul
            ref={refs.setFloating}
            style={{
              position: strategy,
              top: y ?? 0,
              left: x ?? 0,
              width: searchInputRef.current?.offsetWidth ? searchInputRef.current.offsetWidth - 2 : 'auto', // -2 for border
            }}
            className='font-verdana text-sm absolute w-[calc(100%-8px)] m-0 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 left-0 list-none z-[999999999]'
          >
            {filteredCommunitySuggestions.map((address: string, index: number) => (
              <li
                key={address}
                className={`no-underline block p-1.5 cursor-pointer text-gray-700 dark:text-gray-300 overflow-hidden ${
                  index === activeDropdownIndex
                    ? 'bg-gray-800 dark:bg-gray-200 text-white dark:text-gray-900'
                    : 'hover:bg-gray-800 dark:hover:bg-gray-200 hover:text-white dark:hover:text-gray-900'
                }`}
                onClick={() => handleCommunitySelect(address)}
                onTouchEnd={() => handleCommunitySelect(address)}
                onMouseEnter={() => setActiveDropdownIndex(index)}
              >
                {Plebbit.getShortAddress(address)}
              </li>
            ))}
          </ul>
        </FloatingPortal>
      )}
      <div
        className={`relative w-[278px] whitespace-normal rounded bg-orange-100 dark:bg-orange-900 border border-orange-300 dark:border-orange-700 text-sm p-2.5 overflow-hidden z-[1] mt-1.5 mb-3 transition-all duration-300 ease-linear origin-top ${
          showExpando ? 'scale-y-100 visible h-12' : 'scale-y-0 invisible h-5'
        } ${!isInFeedView ? 'h-6' : ''}`}
      >
        <label className='block text-gray-700 dark:text-gray-300 pb-2.5'>
          <input
            className='mr-2 mt-0.5'
            type='checkbox'
            checked={!isInCommunitySearch || !isInFeedView}
            disabled={!isInFeedView}
            onChange={() => handleCommunitySearchToggle(false)}
          />
          {t('go_to_a_community')}
        </label>
        {isInFeedView && (
          <label className='block text-gray-700 dark:text-gray-300 pb-2.5'>
            <input className='mr-2 mt-0.5' type='checkbox' checked={isInCommunitySearch} onChange={() => handleCommunitySearchToggle(true)} />
            {t('search_feed_post')}
          </label>
        )}
      </div>
    </div>
  );
};

export default SearchBar;
