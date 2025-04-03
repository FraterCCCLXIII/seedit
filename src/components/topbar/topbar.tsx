import { useEffect, useRef, useState } from 'react';
import { Link, useLocation, useNavigate, useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAccount, useAccountSubplebbits } from '@plebbit/plebbit-react-hooks';
import Plebbit from '@plebbit/plebbit-js/dist/browser/index.js';
import { sortTypes } from '../../constants/sort-types';
import { isAllView, isHomeView, isModView, isSubplebbitView, isDomainView } from '../../lib/utils/view-utils';
import useContentOptionsStore from '../../stores/use-content-options-store';
import { useDefaultSubplebbitAddresses } from '../../hooks/use-default-subplebbits';
import useTimeFilter from '../../hooks/use-time-filter';
import styles from './topbar.module.css';

const isElectron = window.isElectron === true;

const FiltersDropdown = () => {
  const { t } = useTranslation();
  const params = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const isInDomainView = isDomainView(location.pathname);
  const isInSubplebbitView = isSubplebbitView(location.pathname, params);
  const isinAllView = isAllView(location.pathname);
  const isInModView = isModView(location.pathname);
  const { timeFilterName, timeFilterNames } = useTimeFilter();

  const selectedTimeFilter = timeFilterName || (isInSubplebbitView ? 'all' : timeFilterName);

  const [isFilterDropdownOpen, setIsFilterDropdownOpen] = useState(false);
  const filterDropdownRef = useRef<HTMLDivElement>(null);

  const sortLabels = [t('hot'), t('new'), t('active'), t('top')];
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

  const {
    blurNsfwThumbnails,
    hideAdultCommunities,
    hideGoreCommunities,
    hideAntiCommunities,
    hideVulgarCommunities,
    setBlurNsfwThumbnails,
    setHideAdultCommunities,
    setHideGoreCommunities,
    setHideAntiCommunities,
    setHideVulgarCommunities,
  } = useContentOptionsStore();

  const [hideNsfwFilters, setHideNsfwFilters] = useState(true);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (filterDropdownRef.current && !filterDropdownRef.current.contains(event.target as Node)) {
        setIsFilterDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  return (
    <div className={`${styles.dropdown} ${styles.filterDropdown}`} ref={filterDropdownRef}>
      <span className={styles.selectedTitle} onClick={() => setIsFilterDropdownOpen(!isFilterDropdownOpen)}>
        {selectedSortType} ({timeFilterName})
      </span>
      {isFilterDropdownOpen && (
        <div className={styles.dropChoices}>
          <div className={styles.filterDropdownItem}>
            posts from:{' '}
            <select
              onChange={(e) => {
                navigate(getTimeFilterLink(e.target.value));
              }}
              value={selectedTimeFilter}
            >
              {timeFilterNames.map((timeFilterName, index) => (
                <option value={timeFilterName} key={index}>
                  {timeFilterNames[index]}
                </option>
              ))}
            </select>
          </div>
          <div className={styles.filterDropdownItem}>
            sort posts by:{' '}
            <select
              onChange={(e) => {
                let dropdownLink = isInSubplebbitView ? `/p/${params.subplebbitAddress}/${e.target.value}` : isinAllView ? `/p/all/${e.target.value}` : e.target.value;
                if (timeFilterName) {
                  dropdownLink += `/${timeFilterName}`;
                }
                navigate(dropdownLink);
              }}
              value={selectedSortType}
            >
              {sortTypes.map((sortType, index) => (
                <option value={sortType} key={index}>
                  {sortLabels[index]}
                </option>
              ))}
            </select>
          </div>
          <div className={`${styles.filterDropdownItem} ${styles.nsfwFilters}`} onClick={() => setHideNsfwFilters(!hideNsfwFilters)}>
            NSFW filters
          </div>
          {!hideNsfwFilters && (
            <>
              <div className={styles.filterDropdownItem}>
                <label htmlFor='blurNSFWCheckbox'>
                  <input type='checkbox' id='blurNSFWCheckbox' checked={blurNsfwThumbnails} onChange={(e) => setBlurNsfwThumbnails(e.target.checked)} />
                  blur NSFW/18+ media
                </label>
              </div>
              <div className={styles.filterDropdownItem}>
                <label htmlFor='nsfwCheckbox'>
                  <input
                    type='checkbox'
                    id='nsfwCheckbox'
                    ref={(el) => {
                      if (el) {
                        const allChecked = !hideAdultCommunities && !hideGoreCommunities && !hideAntiCommunities && !hideVulgarCommunities;
                        const someChecked = !hideAdultCommunities || !hideGoreCommunities || !hideAntiCommunities || !hideVulgarCommunities;

                        el.checked = allChecked;
                        el.indeterminate = someChecked && !allChecked;
                      }
                    }}
                    onChange={(e) => {
                      const newValue = e.target.checked;
                      setHideAdultCommunities(!newValue);
                      setHideGoreCommunities(!newValue);
                      setHideAntiCommunities(!newValue);
                      setHideVulgarCommunities(!newValue);
                    }}
                  />
                  include NSFW/18+ communities
                </label>
              </div>
              <div className={styles.filterDropdownItem} style={{ paddingLeft: '20px' }}>
                <label htmlFor='adultCommunitiesCheckbox'>
                  <input type='checkbox' id='adultCommunitiesCheckbox' checked={!hideAdultCommunities} onChange={(e) => setHideAdultCommunities(!e.target.checked)} />
                  adult communities
                </label>
              </div>
              <div className={styles.filterDropdownItem} style={{ paddingLeft: '20px' }}>
                <label htmlFor='goreCommunitiesCheckbox'>
                  <input type='checkbox' id='goreCommunitiesCheckbox' checked={!hideGoreCommunities} onChange={(e) => setHideGoreCommunities(!e.target.checked)} />
                  gore communities
                </label>
              </div>
              <div className={styles.filterDropdownItem} style={{ paddingLeft: '20px' }}>
                <label htmlFor='antiCommunitiesCheckbox'>
                  <input type='checkbox' id='antiCommunitiesCheckbox' checked={!hideAntiCommunities} onChange={(e) => setHideAntiCommunities(!e.target.checked)} />
                  anti communities
                </label>
              </div>
              <div className={styles.filterDropdownItem} style={{ paddingLeft: '20px' }}>
                <label htmlFor='vulgarCommunitiesCheckbox'>
                  <input type='checkbox' id='vulgarCommunitiesCheckbox' checked={!hideVulgarCommunities} onChange={(e) => setHideVulgarCommunities(!e.target.checked)} />
                  vulgar communities
                </label>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
};

const CommunitiesDropdown = () => {
  const { t } = useTranslation();
  const account = useAccount();
  const navigate = useNavigate();
  const subscriptions = account?.subscriptions;
  const isConnectedToRpc = !!account?.plebbitOptions.plebbitRpcClientsOptions;

  const [isSubsDropdownOpen, setIsSubsDropdownOpen] = useState(false);
  const toggleSubsDropdown = () => setIsSubsDropdownOpen(!isSubsDropdownOpen);
  const subsDropdownRef = useRef<HTMLDivElement>(null);
  const subsdropdownItemsRef = useRef<HTMLDivElement>(null);
  const subsDropdownClass = isSubsDropdownOpen ? styles.visible : styles.hidden;

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

  const handleCreateCommunity = () => {
    // creating a community only works if the user is running a full node
    if (isElectron || isConnectedToRpc) {
      navigate('/communities/create');
    } else {
      alert(
        t('create_community_not_available', {
          desktopLink: 'https://github.com/plebbit/seedit/releases/latest',
          cliLink: 'https://github.com/plebbit/plebbit-cli',
          interpolation: { escapeValue: false },
        }),
      );
    }
  };

  return (
    <div className={`${styles.dropdown} ${styles.subsDropdown}`} ref={subsDropdownRef} onClick={toggleSubsDropdown}>
      <span className={styles.selectedTitle}>{t('my_communities')}</span>
      <div className={`${styles.dropChoices} ${styles.subsDropChoices} ${subsDropdownClass}`} ref={subsdropdownItemsRef}>
        {subscriptions?.map((subscription: string, index: number) => (
          <Link key={index} to={`/p/${subscription}`} className={styles.dropdownItem}>
            {Plebbit.getShortAddress(subscription)}
          </Link>
        ))}
        <span onClick={handleCreateCommunity} className={`${styles.dropdownItem} ${styles.myCommunitiesItemButtonDotted}`}>
          {t('create_community')}
        </span>
        <Link to='/communities/vote' className={`${styles.dropdownItem} ${styles.myCommunitiesItemButton}`}>
          {t('default_communities')}
        </Link>
        <Link to='/communities/subscriber' className={`${styles.dropdownItem} ${styles.myCommunitiesItemButton}`}>
          {t('edit_subscriptions')}
        </Link>
      </div>
    </div>
  );
};

const TopBar = () => {
  const subplebbitAddresses = useDefaultSubplebbitAddresses();
  const { t } = useTranslation();
  const location = useLocation();
  const params = useParams();
  const isinAllView = isAllView(location.pathname);
  const isInHomeView = isHomeView(location.pathname);
  const isInModView = isModView(location.pathname);
  const homeButtonClass = isInHomeView ? styles.selected : styles.choice;
  const { hideDefaultCommunities } = useContentOptionsStore();

  const { accountSubplebbits } = useAccountSubplebbits();
  const accountSubplebbitAddresses = Object.keys(accountSubplebbits);

  const account = useAccount();
  const subscriptions = account?.subscriptions;

  const filteredSubplebbitAddresses = subplebbitAddresses?.filter((address) => !subscriptions?.includes(address));

  return (
    <div className={styles.headerArea}>
      <div className={styles.widthClip}>
        <CommunitiesDropdown />
        <FiltersDropdown />
        <div className={styles.srList}>
          <ul className={styles.srBar}>
            <li>
              <Link to='/' className={`${styles.homeButton} ${homeButtonClass}`}>
                {t('home')}
              </Link>
            </li>
            <li>
              <span className={styles.separator}>-</span>
              <Link to='/p/all' className={isinAllView ? styles.selected : styles.choice}>
                {t('all')}
              </Link>
            </li>
            {accountSubplebbitAddresses.length > 0 && (
              <li>
                <span className={styles.separator}>-</span>
                <Link to='/p/mod' className={isInModView ? styles.selected : styles.choice}>
                  {t('mod')}
                </Link>
              </li>
            )}
            {subscriptions?.length > 0 && <span className={styles.separator}> | </span>}
            {subscriptions?.map((subscription: string, index: number) => {
              const shortAddress = Plebbit.getShortAddress(subscription);
              const displayAddress = shortAddress.includes('.eth') ? shortAddress.slice(0, -4) : shortAddress.includes('.sol') ? shortAddress.slice(0, -4) : shortAddress;
              return (
                <li key={index}>
                  {index !== 0 && <span className={styles.separator}>-</span>}
                  <Link to={`/p/${subscription}`} className={params.subplebbitAddress === subscription ? styles.selected : styles.choice}>
                    {displayAddress}
                  </Link>
                </li>
              );
            })}
            {!hideDefaultCommunities && filteredSubplebbitAddresses?.length > 0 && <span className={styles.separator}> | </span>}
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
                    {index !== 0 && <span className={styles.separator}>-</span>}
                    <Link to={`/p/${address}`} className={params.subplebbitAddress === address ? styles.selected : styles.choice}>
                      {displayAddress}
                    </Link>
                  </li>
                );
              })}
          </ul>
        </div>
        <Link to='/communities/vote' className={styles.editLink}>
          {t('edit')} »
        </Link>
      </div>
    </div>
  );
};

export default TopBar;
