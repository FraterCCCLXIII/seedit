import { useCallback, useEffect, useRef, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { createAccount, setActiveAccount, useAccount, useAccounts } from '@plebbit/plebbit-react-hooks';
import { isSettingsView } from '../../lib/utils/view-utils';
// Removed CSS modules import - converted to Tailwind classes
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
  const accountDropdownClass = isAccountDropdownOpen ? 'block' : 'hidden';
  const accountSelectButtonRef = useRef<HTMLDivElement>(null);

  const unreadNotificationCount = account?.unreadNotificationCount ? ` ${account.unreadNotificationCount}` : '';
  const mailClass = unreadNotificationCount ? 'bg-[url("/assets/mail-unread.png")]' : 'bg-[url("/assets/mail.png")]';

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
        className='cursor-pointer py-0.5 px-1 block hover:bg-gray-100 dark:hover:bg-gray-700 sm:py-1.5'
        onClick={() => {
          setActiveAccount(account?.name);
          setIsAccountDropdownOpen(false);
        }}
      >
        u/{account.author.shortAddress}
      </span>
    ));

  accountDropdownOptions.push(
    <Link key='create' to='#' className='cursor-pointer py-0.5 px-1 block hover:bg-gray-100 dark:hover:bg-gray-700 sm:py-1.5' onClick={() => createAccount()}>
      +{t('create')}
    </Link>,
  );

  return (
    <div className='absolute right-0 top-5 rounded-bl-lg bg-gray-100 dark:bg-gray-800 p-1 leading-3 z-[8]'>
      <span className='text-gray-800 dark:text-gray-200'>
        <Link to='/profile' className='text-gray-800 dark:text-gray-200 cursor-pointer'>
          {account?.author?.shortAddress}
        </Link>
        {karma && (
          <span className='text-gray-500 dark:text-gray-400'>
            {' '}
            (<span className='font-bold'>{karma?.postScore + 1}</span>)
          </span>
        )}
        <span
          className="bg-none bg-no-repeat bg-center bg-right bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAiIGhlaWdodD0iNiIgdmlld0JveD0iMCAwIDEwIDYiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxwYXRoIGQ9Ik01IDZMMCAwSDEwTDUgNloiIGZpbGw9IiM2NjY2NjYiLz4KPHN2Zz4K')] pr-5 -mr-1.5 cursor-pointer"
          ref={accountSelectButtonRef}
          onClick={toggleAccountDropdown}
        />
        {isAccountDropdownOpen && (
          <div className={`float-left cursor-pointer relative ${accountDropdownClass}`} ref={accountDropdownRef}>
            <div
              className='top-4 absolute left-0 border border-gray-400 dark:border-gray-600 bg-white dark:bg-gray-900 text-gray-800 dark:text-gray-200 whitespace-nowrap leading-normal'
              ref={accountdropdownItemsRef}
            >
              {accountDropdownOptions}
            </div>
          </div>
        )}
      </span>
      <span className='text-gray-500 dark:text-gray-400 mx-2 cursor-default'>|</span>
      <Link to='/inbox' className='no-underline text-lg cursor-pointer'>
        <span className={`bg-no-repeat bg-center w-4 h-2.5 inline-block align-middle ${mailClass}`} />
        {unreadNotificationCount && <span className='bg-orange-500 text-white text-xs font-bold px-1 ml-1 rounded-sm inline-block'>{unreadNotificationCount}</span>}
      </Link>
      <span>
        <span className='text-gray-500 dark:text-gray-400 mx-2 cursor-default'>|</span>
        <span className='no-underline text-lg cursor-pointer' onClick={toggleSearchVisible} ref={searchBarButtonRef}>
          🔎
        </span>
        {searchVisible && (
          <div className='absolute rounded-lg right-1.5 top-6 z-[3]' ref={searchBarRef}>
            <SearchBar isFocused={isFocused} />
          </div>
        )}
      </span>
      <span className='text-gray-500 dark:text-gray-400 mx-2 cursor-default'>|</span>
      <Link to='/settings' className={`no-underline font-bold text-gray-800 dark:text-gray-200 hover:underline ${isInSettingsView ? 'text-green-500' : ''}`}>
        {t('preferences')}
      </Link>
    </div>
  );
};

export default AccountBar;
