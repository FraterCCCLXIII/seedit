import { useEffect, useRef, useState, useMemo, memo } from 'react';
import { Link, useLocation, useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAccount, useAccountSubplebbits } from '@plebbit/plebbit-react-hooks';
import Plebbit from '@plebbit/plebbit-js';
import { isAllView, isDomainView, isHomeView, isModView, isSubplebbitView } from '../../lib/utils/view-utils';
import useContentOptionsStore from '../../stores/use-content-options-store';
import { useDefaultSubplebbitAddresses, useDefaultSubplebbits } from '../../hooks/use-default-subplebbits';
import useTimeFilter, { setSessionTimeFilterPreference } from '../../hooks/use-time-filter';
import { sortTypes } from '../../constants/sort-types';
import { sortLabels } from '../../constants/sort-labels';
import { handleNSFWSubscriptionPrompt } from '../../lib/utils/nsfw-subscription-utils';
// Removed CSS modules import - converted to Tailwind classes

const CommunitiesDropdown = () => {
  const { t } = useTranslation();
  const account = useAccount();
  const subscriptions = useMemo(() => account?.subscriptions, [account?.subscriptions]);
  const reversedSubscriptions = useMemo(() => (subscriptions ? [...subscriptions].reverse() : []), [subscriptions]);

  const [isSubsDropdownOpen, setIsSubsDropdownOpen] = useState(false);
  const toggleSubsDropdown = () => setIsSubsDropdownOpen(!isSubsDropdownOpen);
  const subsDropdownRef = useRef<HTMLDivElement>(null);
  const subsdropdownItemsRef = useRef<HTMLDivElement>(null);
  const subsDropdownClass = isSubsDropdownOpen ? 'block' : 'hidden';

  const handleClickOutside = (event: MouseEvent) => {
    if (subsDropdownRef.current && !subsDropdownRef.current.contains(event.target as Node)) {
      setIsSubsDropdownOpen(false);
    }
  };

  useEffect(() => {
    if (isSubsDropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
  }, [isSubsDropdownOpen]);

  return (
    <div className='float-left inline relative pl-1 cursor-pointer' ref={subsDropdownRef} onClick={toggleSubsDropdown}>
      <span className="bg-none bg-no-repeat bg-center bg-right inline-block align-bottom pr-5 pl-1 text-gray-700 dark:text-gray-300 font-normal -ml-1 cursor-pointer bg-[url('/assets/buttons/droparrowgray.gif')]">
        {t('my_communities')}
      </span>
      <div
        className={`absolute top-[18px] mt-0 left-0 border border-gray-300 bg-white dark:bg-gray-800 whitespace-nowrap leading-normal z-10 ml-1 ${subsDropdownClass}`}
        ref={subsdropdownItemsRef}
      >
        {reversedSubscriptions?.map((subscription: string, index: number) => (
          <Link
            key={index}
            to={`/p/${subscription}`}
            className='cursor-pointer py-0.5 px-1 block hover:bg-gray-100 dark:hover:bg-gray-700 no-underline text-gray-900 dark:text-gray-100'
          >
            {Plebbit.getShortAddress(subscription)}
          </Link>
        ))}
        <Link
          to='/communities/subscriber'
          className='cursor-pointer py-0.5 px-1 block hover:bg-gray-100 dark:hover:bg-gray-700 no-underline text-gray-900 dark:text-gray-100 italic uppercase border-t border-dotted border-gray-600'
        >
          {t('edit_subscriptions')}
        </Link>
      </div>
    </div>
  );
};

const TagFilterDropdown = () => {
  const { t } = useTranslation();
  const account = useAccount();
  const defaultSubplebbits = useDefaultSubplebbits();
  const {
    hideAdultCommunities,
    hideGoreCommunities,
    hideAntiCommunities,
    hideVulgarCommunities,
    setHideAdultCommunities,
    setHideGoreCommunities,
    setHideAntiCommunities,
    setHideVulgarCommunities,
  } = useContentOptionsStore();

  const tags = useMemo(
    () => [
      { name: 'adult', isHidden: hideAdultCommunities, setter: setHideAdultCommunities },
      { name: 'gore', isHidden: hideGoreCommunities, setter: setHideGoreCommunities },
      { name: 'vulgar', isHidden: hideVulgarCommunities, setter: setHideVulgarCommunities },
      { name: 'anti', isHidden: hideAntiCommunities, setter: setHideAntiCommunities },
    ],
    [
      hideAdultCommunities,
      hideGoreCommunities,
      hideAntiCommunities,
      hideVulgarCommunities,
      setHideAdultCommunities,
      setHideGoreCommunities,
      setHideAntiCommunities,
      setHideVulgarCommunities,
    ],
  );

  const [isTagFilterDropdownOpen, setIsTagFilterDropdownOpen] = useState(false);
  const toggleTagFilterDropdown = () => setIsTagFilterDropdownOpen(!isTagFilterDropdownOpen);
  const tagFilterDropdownRef = useRef<HTMLDivElement>(null);
  const tagFilterdropdownItemsRef = useRef<HTMLDivElement>(null);
  const tagFilterDropdownClass = isTagFilterDropdownOpen ? 'block' : 'hidden';

  const allHidden = hideAdultCommunities && hideGoreCommunities && hideAntiCommunities && hideVulgarCommunities;

  const handleToggleAll = async (event: React.MouseEvent) => {
    event.stopPropagation();
    const newState = !allHidden;

    if (!newState) {
      await handleNSFWSubscriptionPrompt({
        account,
        defaultSubplebbits,
        tagsToShow: ['adult', 'gore', 'anti', 'vulgar'],
        isShowingAll: true,
      });
    }

    setHideAdultCommunities(newState);
    setHideGoreCommunities(newState);
    setHideAntiCommunities(newState);
    setHideVulgarCommunities(newState);
  };

  const handleToggleTag = async (event: React.MouseEvent, setter: (hide: boolean) => void, currentState: boolean, tagName: string) => {
    event.stopPropagation();
    const newState = !currentState;

    if (!newState) {
      await handleNSFWSubscriptionPrompt({
        account,
        defaultSubplebbits,
        tagsToShow: [tagName],
      });
    }

    setter(newState);
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (tagFilterDropdownRef.current && !tagFilterDropdownRef.current.contains(event.target as Node)) {
        setIsTagFilterDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  return (
    <div className='float-left inline relative' ref={tagFilterDropdownRef} onClick={toggleTagFilterDropdown}>
      <span className="bg-none bg-no-repeat bg-center bg-right inline-block align-bottom pr-5 pl-1 text-gray-700 dark:text-gray-300 font-normal -ml-1 cursor-pointer bg-[url('/assets/buttons/droparrowgray.gif')]">
        {t('tags')}
      </span>
      <div
        className={`absolute top-[18px] mt-0 left-0 border border-gray-300 bg-white dark:bg-gray-800 whitespace-nowrap leading-normal z-10 p-1 text-xs ${tagFilterDropdownClass}`}
        ref={tagFilterdropdownItemsRef}
      >
        <div className='cursor-pointer py-0.5 px-1 block hover:bg-gray-100 dark:hover:bg-gray-700' onClick={handleToggleAll} style={{ cursor: 'pointer' }}>
          <span>{allHidden ? t('show_all_nsfw') : t('hide_all_nsfw')}</span>
        </div>
        {tags.map((tag, index) => (
          <div
            key={index}
            className='cursor-pointer py-0.5 px-1 block hover:bg-gray-100 dark:hover:bg-gray-700'
            onClick={(e) => handleToggleTag(e, tag.setter, tag.isHidden, tag.name)}
            style={{ cursor: 'pointer' }}
          >
            <span>
              {tag.isHidden ? t('show') : t('hide')} <i>{tag.name}</i>
            </span>
          </div>
        ))}
        <Link
          to='/settings/content-options'
          className='cursor-pointer py-0.5 px-1 block hover:bg-gray-100 dark:hover:bg-gray-700 no-underline text-gray-900 dark:text-gray-100 italic uppercase border-t border-dotted border-gray-600'
        >
          {t('content_options')}
        </Link>
      </div>
    </div>
  );
};

const SortTypesDropdown = () => {
  const { t } = useTranslation();
  const params = useParams();
  const location = useLocation();
  const isInSubplebbitView = isSubplebbitView(location.pathname, params);
  const isinAllView = isAllView(location.pathname);
  const { timeFilterName } = useTimeFilter();

  const selectedSortType = params.sortType || 'hot';

  const getSelectedSortLabel = () => {
    const index = sortTypes.indexOf(selectedSortType);
    return index >= 0 ? sortLabels[index] : sortLabels[0];
  };

  const [isSortsDropdownOpen, setIsSortsDropdownOpen] = useState(false);
  const toggleSortsDropdown = () => setIsSortsDropdownOpen(!isSortsDropdownOpen);
  const sortsDropdownRef = useRef<HTMLDivElement>(null);
  const sortsdropdownItemsRef = useRef<HTMLDivElement>(null);
  const sortsDropdownClass = isSortsDropdownOpen ? 'block' : 'hidden';

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (sortsDropdownRef.current && !sortsDropdownRef.current.contains(event.target as Node)) {
        setIsSortsDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  return (
    <div className='float-left inline relative' ref={sortsDropdownRef} onClick={toggleSortsDropdown}>
      <span className="bg-none bg-no-repeat bg-center bg-right inline-block align-bottom pr-5 pl-1 text-gray-700 dark:text-gray-300 font-normal -ml-1 cursor-pointer bg-[url('/assets/buttons/droparrowgray.gif')]">
        {t(getSelectedSortLabel())}
      </span>
      <div
        className={`absolute top-[18px] mt-0 left-0 border border-gray-300 bg-white dark:bg-gray-800 whitespace-nowrap leading-normal z-10 ${sortsDropdownClass}`}
        ref={sortsdropdownItemsRef}
      >
        {sortTypes.map((sortType, index) => {
          let dropdownLink = isInSubplebbitView ? `/p/${params.subplebbitAddress}/${sortType}` : isinAllView ? `/p/all/${sortType}` : sortType;
          if (timeFilterName) {
            dropdownLink += `/${timeFilterName}`;
          }
          return (
            <Link
              to={dropdownLink}
              key={index}
              className='cursor-pointer py-0.5 px-1 block hover:bg-gray-100 dark:hover:bg-gray-700 no-underline text-gray-900 dark:text-gray-100'
            >
              {t(sortLabels[index])}
            </Link>
          );
        })}
      </div>
    </div>
  );
};

const TimeFilterDropdown = () => {
  const params = useParams();
  const location = useLocation();
  const isInSubplebbitView = isSubplebbitView(location.pathname, params);
  const isInDomainView = isDomainView(location.pathname);
  const isinAllView = isAllView(location.pathname);
  const isInModView = isModView(location.pathname);
  const { timeFilterName, timeFilterNames, sessionKey } = useTimeFilter();
  const selectedTimeFilter = timeFilterName || (isInSubplebbitView ? 'all' : timeFilterName);

  const [isTimeFilterDropdownOpen, setIsTimeFilterDropdownOpen] = useState(false);
  const toggleTimeFilterDropdown = () => setIsTimeFilterDropdownOpen(!isTimeFilterDropdownOpen);
  const timeFilterDropdownRef = useRef<HTMLDivElement>(null);
  const timeFilterdropdownItemsRef = useRef<HTMLDivElement>(null);
  const timeFilterDropdownClass = isTimeFilterDropdownOpen ? 'block' : 'hidden';

  const selectedSortType = params.sortType || 'hot';

  const getTimeFilterLink = (timeFilterName: string) => {
    return isInSubplebbitView
      ? `/p/${params.subplebbitAddress}/${selectedSortType}/${timeFilterName}`
      : isinAllView
      ? `p/all/${selectedSortType}/${timeFilterName}`
      : isInModView
      ? `/p/mod/${selectedSortType}/${timeFilterName}`
      : isInDomainView
      ? `/domain/${params.domain}/${selectedSortType}/${timeFilterName}`
      : `/${selectedSortType}/${timeFilterName}`;
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (timeFilterDropdownRef.current && !timeFilterDropdownRef.current.contains(event.target as Node)) {
        setIsTimeFilterDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  return (
    <div className='float-left inline relative' ref={timeFilterDropdownRef} onClick={toggleTimeFilterDropdown}>
      <span className="bg-none bg-no-repeat bg-center bg-right inline-block align-bottom pr-5 pl-1 text-gray-700 dark:text-gray-300 font-normal -ml-1 cursor-pointer bg-[url('/assets/buttons/droparrowgray.gif')]">
        {selectedTimeFilter}
      </span>
      <div
        className={`absolute top-[18px] mt-0 left-0 border border-gray-300 bg-white dark:bg-gray-800 whitespace-nowrap leading-normal z-10 p-1 text-xs ${timeFilterDropdownClass}`}
        ref={timeFilterdropdownItemsRef}
      >
        {timeFilterNames.slice(0, -1).map((timeFilterName, index) => (
          <Link
            to={getTimeFilterLink(timeFilterName)}
            key={index}
            className='cursor-pointer py-0.5 px-1 block hover:bg-gray-100 dark:hover:bg-gray-700 no-underline text-gray-900 dark:text-gray-100'
            onClick={() => setSessionTimeFilterPreference(sessionKey, timeFilterName)}
          >
            {timeFilterNames[index]}
          </Link>
        ))}
      </div>
    </div>
  );
};

const TopBar = memo(() => {
  const { t } = useTranslation();
  const location = useLocation();
  const params = useParams();

  const isinAllView = isAllView(location.pathname);
  const isInHomeView = isHomeView(location.pathname);
  const isInModView = isModView(location.pathname);
  const homeButtonClass = isInHomeView ? 'text-green-500 font-bold' : 'no-underline text-gray-700 dark:text-gray-300 hover:underline cursor-pointer';

  const { hideDefaultCommunities } = useContentOptionsStore();
  const subplebbitAddresses = useDefaultSubplebbitAddresses();
  const { accountSubplebbits } = useAccountSubplebbits();
  const accountSubplebbitAddresses = useMemo(() => Object.keys(accountSubplebbits), [accountSubplebbits]);

  const account = useAccount();
  const subscriptions = useMemo(() => account?.subscriptions, [account?.subscriptions]);
  const reversedSubscriptions = useMemo(() => (subscriptions ? [...subscriptions].reverse() : []), [subscriptions]);

  const filteredSubplebbitAddresses = useMemo(() => subplebbitAddresses?.filter((address) => !subscriptions?.includes(address)), [subplebbitAddresses, subscriptions]);

  return (
    <div className='bg-gray-100 dark:bg-gray-800 whitespace-nowrap uppercase border-b border-gray-300 dark:border-gray-600 text-sm h-[18px] leading-[18px] text-gray-700 dark:text-gray-300'>
      <div className='flex'>
        <CommunitiesDropdown />
        <TagFilterDropdown />
        <SortTypesDropdown />
        <TimeFilterDropdown />
        <div className='overflow-hidden overflow-x-auto scrollbar-none'>
          <ul className='list-none inline m-0 p-0 list-none inline-flex'>
            <li>
              <Link to='/' className={`ml-1 md:ml-2 ${homeButtonClass}`}>
                {t('home')}
              </Link>
            </li>
            <li>
              <span className='text-gray-500 cursor-default mx-2'>-</span>
              <Link
                to='/p/all'
                className={isinAllView ? 'text-green-500 font-bold hover:underline' : 'no-underline text-gray-700 dark:text-gray-300 hover:underline cursor-pointer'}
              >
                {t('all')}
              </Link>
            </li>
            {accountSubplebbitAddresses.length > 0 && (
              <li>
                <span className='text-gray-500 cursor-default mx-2'>-</span>
                <Link
                  to='/p/mod'
                  className={isInModView ? 'text-green-500 font-bold hover:underline' : 'no-underline text-gray-700 dark:text-gray-300 hover:underline cursor-pointer'}
                >
                  {t('mod')}
                </Link>
              </li>
            )}
            {subscriptions?.length > 0 && <span className='text-gray-500 cursor-default mx-2'> | </span>}
            {reversedSubscriptions?.map((subscription: string, index: number) => {
              const shortAddress = Plebbit.getShortAddress(subscription);
              const displayAddress = shortAddress.includes('.eth') ? shortAddress.slice(0, -4) : shortAddress.includes('.sol') ? shortAddress.slice(0, -4) : shortAddress;
              return (
                <li key={index}>
                  {index !== 0 && <span className='text-gray-500 cursor-default mx-2'>-</span>}
                  <Link
                    to={`/p/${subscription}`}
                    className={
                      params.subplebbitAddress === subscription
                        ? 'text-green-500 font-bold hover:underline'
                        : 'no-underline text-gray-700 dark:text-gray-300 hover:underline cursor-pointer'
                    }
                  >
                    {displayAddress}
                  </Link>
                </li>
              );
            })}
            {!hideDefaultCommunities && filteredSubplebbitAddresses?.length > 0 && <span className='text-gray-500 cursor-default mx-2'> | </span>}
            {!hideDefaultCommunities &&
              filteredSubplebbitAddresses?.map((address, index) => {
                const shortAddress = Plebbit.getShortAddress(address);
                const displayAddress = shortAddress.includes('.eth')
                  ? shortAddress.slice(0, -4)
                  : shortAddress.includes('.sol')
                  ? shortAddress.slice(0, -4)
                  : shortAddress;
                return (
                  <li key={index}>
                    {index !== 0 && <span className='text-gray-500 cursor-default mx-2'>-</span>}
                    <Link
                      to={`/p/${address}`}
                      className={
                        params.subplebbitAddress === address
                          ? 'text-green-500 font-bold hover:underline'
                          : 'no-underline text-gray-700 dark:text-gray-300 hover:underline cursor-pointer'
                      }
                    >
                      {displayAddress}
                    </Link>
                  </li>
                );
              })}
          </ul>
        </div>
        <Link to='/communities/vote' className='text-gray-700 dark:text-gray-300 no-underline bg-gray-100 dark:bg-gray-800 px-2 py-0 font-bold ml-auto hover:underline'>
          {t('edit')} »
        </Link>
      </div>
    </div>
  );
});

export default TopBar;
