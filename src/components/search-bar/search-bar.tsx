import { useCallback, useEffect, useRef, useState, useMemo } from 'react';
import { useLocation, useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import styles from './search-bar.module.css';
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
  const [isInCommunitySearch, setIsInCommunitySearch] = useState(!!currentQuery || isInFeedView);
  const placeholder = isInCommunitySearch ? t('search_posts') : t('enter_community_address');
  const [showExpando, setShowExpando] = useState(false);

  const searchBarRef = useRef<HTMLFormElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);

  const [inputValue, setInputValue] = useState(currentQuery);
  const { setIsSearching } = useFeedFiltersStore();

  const defaultSubplebbitAddresses = useDefaultSubplebbitAddresses();
  const [isInputFocused, setIsInputFocused] = useState(false);
  const [activeDropdownIndex, setActiveDropdownIndex] = useState<number>(-1);

  const filteredCommunitySuggestions = useMemo(() => {
    if (!inputValue || isInCommunitySearch) return [];
    return defaultSubplebbitAddresses.filter((address) => address?.toLowerCase()?.includes(inputValue.toLowerCase())).slice(0, 10);
  }, [inputValue, defaultSubplebbitAddresses, isInCommunitySearch]);

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
    setIsInCommunitySearch(!!searchParams.get('q') || isInFeedView);
  }, [location.search, isInFeedView, searchParams]);

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
    [isInputFocused, isInCommunitySearch, filteredCommunitySuggestions, activeDropdownIndex, handleCommunitySelect, inputValue, navigate],
  );

  return (
    <div ref={wrapperRef} className={`${styles.searchBarWrapper} ${isInHomeAboutView || isInSubplebbitAboutView || isInPostPageAboutView ? styles.mobileInfobar : ''}`}>
      <form className={styles.searchBar} ref={searchBarRef} onSubmit={handleSearchSubmit}>
        <input
          type='text'
          autoCorrect='off'
          autoComplete='off'
          spellCheck='false'
          autoCapitalize='off'
          placeholder={placeholder}
          ref={searchInputRef}
          onFocus={() => {
            setShowExpando(true);
            setIsInputFocused(true);
          }}
          onChange={handleSearchChange}
          value={inputValue}
          onKeyDown={handleKeyDown}
          onBlur={() => setTimeout(() => setIsInputFocused(false), 150)}
        />
        <input type='submit' value='' />
      </form>
      {!isInCommunitySearch && isInputFocused && filteredCommunitySuggestions.length > 0 && (
        <ul className={styles.dropdown}>
          {filteredCommunitySuggestions.map((address, index) => (
            <li
              key={address}
              className={`${styles.dropdownItem} ${index === activeDropdownIndex ? styles.activeDropdownItem : ''}`}
              onClick={() => handleCommunitySelect(address)}
              onMouseEnter={() => setActiveDropdownIndex(index)}
            >
              {address}
            </li>
          ))}
        </ul>
      )}
      <div className={`${styles.infobar} ${showExpando ? styles.slideDown : styles.slideUp} ${!isInFeedView ? styles.lessHeight : ''}`}>
        {isInFeedView && (
          <label>
            <input type='checkbox' checked={isInCommunitySearch} onChange={() => handleCommunitySearchToggle(true)} />
            {t('search_feed_post')}
          </label>
        )}
        <label>
          <input
            type='checkbox'
            checked={!isInCommunitySearch}
            disabled={!isInFeedView} // Disable if not in a view where feed search makes sense
            onChange={() => handleCommunitySearchToggle(false)}
          />
          {t('go_to_a_community')}
        </label>
      </div>
    </div>
  );
};

export default SearchBar;
