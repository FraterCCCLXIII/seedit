import { useCallback, useEffect, useRef, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { createAccount, setActiveAccount, useAccount, useAccounts } from '@plebbit/plebbit-react-hooks';
import { isSettingsView } from '../../lib/utils/view-utils';
import SearchBar from '../search-bar';

const AccountBar = () => {
  const { t } = useTranslation();
  const location = useLocation();
  const account = useAccount();
  const { accounts } = useAccounts();
  const { karma } = account || {};

  const isInSettingsView = isSettingsView(location.pathname);

  const [searchVisible, setSearchVisible] = useState(false);
  const toggleSearchVisible = () => setSearchVisible(!searchVisible);
  const searchBarRef = useRef<HTMLDivElement>(null);
  const searchBarButtonRef = useRef<HTMLDivElement>(null);

  const [isAccountDropdownOpen, setIsAccountDropdownOpen] = useState(false);
  const toggleAccountDropdown = () => setIsAccountDropdownOpen(!isAccountDropdownOpen);
  const accountDropdownRef = useRef<HTMLDivElement>(null);
  const accountdropdownItemsRef = useRef<HTMLDivElement>(null);
  const accountSelectButtonRef = useRef<HTMLDivElement>(null);

  const unreadNotificationCount = account?.unreadNotificationCount ? ` ${account.unreadNotificationCount}` : '';

  const handleClickOutside = useCallback(
    (event: MouseEvent) => {
      const target = event.target as Node;

      const isOutsideSearchBar =
        searchBarRef.current && !searchBarRef.current.contains(target) && searchBarButtonRef.current && !searchBarButtonRef.current.contains(target);
      const isOutsideAccountDropdown =
        accountDropdownRef.current &&
        !accountDropdownRef.current.contains(target) &&
        accountdropdownItemsRef.current &&
        !accountdropdownItemsRef.current.contains(target);
      const isOutsideAccountSelectButton = accountSelectButtonRef.current && !accountSelectButtonRef.current.contains(target);

      if (isOutsideAccountSelectButton && isOutsideAccountDropdown) {
        setIsAccountDropdownOpen(false);
      }

      if (isOutsideSearchBar) {
        setSearchVisible(false);
      }
    },
    [searchBarRef, accountSelectButtonRef, accountDropdownRef, accountdropdownItemsRef],
  );

  const [isFocused, setIsFocused] = useState(false);
  useEffect(() => {
    if (searchVisible) {
      setIsFocused(true);
    }
  }, [searchVisible]);

  useEffect(() => {
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [handleClickOutside]);

  const accountDropdownOptions = accounts
    .filter((account) => account?.author?.shortAddress)
    .map((account, index) => (
      <span
        key={index}
        onClick={() => {
          setActiveAccount(account?.name);
          setIsAccountDropdownOpen(false);
        }}
      >
        u/{account.author.shortAddress}

    </span>
    ));

  accountDropdownOptions.push(
    <Link key='create' to='/create'>
      {t('create')}
    </Link>,
  );

  return (
    <span>
      <Link to='/profile'>{account?.author?.shortAddress}</Link>
      {karma && (
        <span>
          {' '}
          {karma}
        </span>
      )}
      {isAccountDropdownOpen && (
        <div>
          {accountDropdownOptions}
        </div>
      )}
    </span>
  );
};

export default AccountBar;
