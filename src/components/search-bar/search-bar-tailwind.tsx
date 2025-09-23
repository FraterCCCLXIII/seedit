import { useCallback, useEffect, useRef, useState, useMemo } from 'react';
import { useLocation, useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useFloating, autoUpdate, offset, shift, FloatingPortal } from '@floating-ui/react';
import { useAccount } from '@plebbit/plebbit-react-hooks';
import Plebbit from '@plebbit/plebbit-js';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
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
import { Search, X, TrendingUp, Users, Shield, Filter } from 'lucide-react';

interface SearchBarProps {
  isFocused?: boolean;
  onExpandoChange?: (expanded: boolean) => void;
}

const SearchBar = ({ isFocused = false, onExpandoChange }: SearchBarProps) => {
  const { t } = useTranslation();
  const location = useLocation();
  const navigate = useNavigate();
  const params = useParams();
  const [searchParams] = useSearchParams();
  const account = useAccount();
  
  // State
  const [inputValue, setInputValue] = useState('');
  const [isInputFocused, setIsInputFocused] = useState(isFocused);
  const [showExpando, setShowExpando] = useState(false);
  const [activeDropdownIndex, setActiveDropdownIndex] = useState(-1);
  const [isInCommunitySearch, setIsInCommunitySearch] = useState(false);
  
  // Refs
  const searchInputRef = useRef<HTMLInputElement>(null);
  const searchBarRef = useRef<HTMLFormElement>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);
  
  // Hooks
  const { feedFilters, setFeedFilters } = useFeedFiltersStore();
  const { defaultSubplebbitAddresses } = useDefaultSubplebbitAddresses();
  
  // Floating UI
  const { refs, floatingStyles, context } = useFloating({
    open: isInputFocused && isInCommunitySearch,
    onOpenChange: () => {},
    middleware: [offset(4), shift()],
    whileElementsMounted: autoUpdate,
  });

  // View detection
  const isInHomeView = isHomeView(location.pathname);
  const isInHomeAboutView = isHomeAboutView(location.pathname);
  const isInPostPageView = isPostPageView(location.pathname);
  const isInPostPageAboutView = isPostPageAboutView(location.pathname);
  const isInSubplebbitView = isSubplebbitView(location.pathname);
  const isInAllView = isAllView(location.pathname);
  const isInModView = isModView(location.pathname);
  const isInSubplebbitAboutView = isSubplebbitAboutView(location.pathname);
  const isInFeedView = isInHomeView || isInAllView || isInSubplebbitView || isInModView;

  // Computed values
  const placeholder = isInCommunitySearch ? t('search_communities') : t('search_posts');
  
  // Community suggestions
  const communitySuggestions = useMemo(() => {
    if (!isInCommunitySearch || !inputValue) return [];
    
    const filtered = defaultSubplebbitAddresses.filter(address => 
      address.toLowerCase().includes(inputValue.toLowerCase())
    );
    
    return filtered.slice(0, 10); // Limit to 10 suggestions
  }, [inputValue, isInCommunitySearch, defaultSubplebbitAddresses]);

  // Handlers
  const handleSearchChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setInputValue(value);
    
    if (value.startsWith('p/')) {
      setIsInCommunitySearch(true);
    } else {
      setIsInCommunitySearch(false);
    }
  }, []);

  const handleSearchSubmit = useCallback((e: React.FormEvent) => {
    e.preventDefault();
    
    if (isInCommunitySearch && inputValue.startsWith('p/')) {
      const address = inputValue.replace('p/', '');
      navigate(`/p/${address}`);
    } else if (inputValue.trim()) {
      // Search posts
      const searchQuery = encodeURIComponent(inputValue.trim());
      navigate(`/search?q=${searchQuery}`);
    }
    
    setInputValue('');
    setIsInputFocused(false);
    setShowExpando(false);
  }, [inputValue, isInCommunitySearch, navigate]);

  const handleCommunitySelect = useCallback((address: string) => {
    navigate(`/p/${address}`);
    setInputValue('');
    setIsInputFocused(false);
    setShowExpando(false);
  }, [navigate]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (!isInCommunitySearch || communitySuggestions.length === 0) return;
    
    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setActiveDropdownIndex(prev => 
          prev < communitySuggestions.length - 1 ? prev + 1 : prev
        );
        break;
      case 'ArrowUp':
        e.preventDefault();
        setActiveDropdownIndex(prev => prev > 0 ? prev - 1 : -1);
        break;
      case 'Enter':
        e.preventDefault();
        if (activeDropdownIndex >= 0) {
          handleCommunitySelect(communitySuggestions[activeDropdownIndex]);
        }
        break;
      case 'Escape':
        setIsInputFocused(false);
        setShowExpando(false);
        break;
    }
  }, [isInCommunitySearch, communitySuggestions, activeDropdownIndex, handleCommunitySelect]);

  const handleFocus = useCallback(() => {
    setShowExpando(true);
    setIsInputFocused(true);
    onExpandoChange?.(true);
  }, [onExpandoChange]);

  const handleBlur = useCallback(() => {
    setTimeout(() => {
      setIsInputFocused(false);
      onExpandoChange?.(false);
    }, 150);
  }, [onExpandoChange]);

  const clearSearch = useCallback(() => {
    setInputValue('');
    setIsInCommunitySearch(false);
    searchInputRef.current?.focus();
  }, []);

  // Effects
  useEffect(() => {
    if (isFocused && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [isFocused]);

  return (
    <div ref={wrapperRef} className="w-full max-w-md mx-auto mb-6">
      {/* Search Input */}
      <div className="relative">
        <form ref={searchBarRef} onSubmit={handleSearchSubmit} className="relative">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              ref={searchInputRef}
              type="text"
              placeholder={placeholder}
              value={inputValue}
              onChange={handleSearchChange}
              onKeyDown={handleKeyDown}
              onFocus={handleFocus}
              onBlur={handleBlur}
              className="pl-10 pr-10 h-12 text-base border-2 focus:border-primary transition-colors"
              autoCorrect="off"
              autoComplete="off"
              spellCheck="false"
              autoCapitalize="off"
            />
            {inputValue && (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={clearSearch}
                className="absolute right-2 top-1/2 transform -translate-y-1/2 h-8 w-8 p-0 hover:bg-muted"
              >
                <X className="w-4 h-4" />
              </Button>
            )}
          </div>
        </form>

        {/* Dropdown Suggestions */}
        {context.open && communitySuggestions.length > 0 && (
          <FloatingPortal>
            <Card
              ref={refs.setFloating}
              style={floatingStyles}
              className="w-full max-h-60 overflow-y-auto shadow-lg border-2"
            >
              <CardContent className="p-0">
                {communitySuggestions.map((address, index) => (
                  <button
                    key={address}
                    className={`w-full px-4 py-3 text-left hover:bg-muted transition-colors flex items-center space-x-3 ${
                      index === activeDropdownIndex ? 'bg-muted' : ''
                    }`}
                    onClick={() => handleCommunitySelect(address)}
                    onMouseEnter={() => setActiveDropdownIndex(index)}
                  >
                    <Users className="w-4 h-4 text-muted-foreground" />
                    <span className="font-medium">p/{address}</span>
                  </button>
                ))}
              </CardContent>
            </Card>
          </FloatingPortal>
        )}
      </div>

      {/* Filter Options */}
      {showExpando && isInFeedView && (
        <Card className="mt-4 animate-in slide-in-from-top-2 duration-200">
          <CardContent className="p-4">
            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <Filter className="w-4 h-4 text-muted-foreground" />
                <span className="text-sm font-medium">{t('filter_options')}</span>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <Button
                  variant={feedFilters.sort === 'hot' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setFeedFilters({ ...feedFilters, sort: 'hot' })}
                  className="justify-start"
                >
                  <TrendingUp className="w-4 h-4 mr-2" />
                  {t('hot')}
                </Button>
                
                <Button
                  variant={feedFilters.sort === 'new' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setFeedFilters({ ...feedFilters, sort: 'new' })}
                  className="justify-start"
                >
                  <Shield className="w-4 h-4 mr-2" />
                  {t('new')}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default SearchBar;
