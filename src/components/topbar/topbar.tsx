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

const CommunitiesDropdown = () => {
  const { t } = useTranslation();
  const account = useAccount();
  const subscriptions = useMemo(() => account?.subscriptions, [account?.subscriptions]);
  const reversedSubscriptions = useMemo(() => (subscriptions ? [...subscriptions].reverse() : []), [subscriptions]);

  const [isSubsDropdownOpen, setIsSubsDropdownOpen] = useState(false);
  const toggleSubsDropdown = () => setIsSubsDropdownOpen(!isSubsDropdownOpen);
  const subsDropdownRef = useRef<HTMLDivElement>(null);
  const subsdropdownItemsRef = useRef<HTMLDivElement>(null);

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
        {reversedSubscriptions?.map((subscription: string, index: number) => (
            {Plebbit.getShortAddress(subscription)}
          </Link>
        ))}
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
        </div>
        {tags.map((tag, index) => (
              {tag.isHidden ? t('show') : t('hide')} <i>{tag.name}</i>
            </span>
          </div>
        ))}
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
        {sortTypes.map((sortType, index) => {
          let dropdownLink = isInSubplebbitView ? `/p/${params.subplebbitAddress}/${sortType}` : isinAllView ? `/p/all/${sortType}` : sortType;
          if (timeFilterName) {
            dropdownLink += `/${timeFilterName}`;
          }
          return (
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
        {timeFilterNames.slice(0, -1).map((timeFilterName, index) => (
          <Link
            to={getTimeFilterLink(timeFilterName)}
            key={index}
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

  const { hideDefaultCommunities } = useContentOptionsStore();
  const subplebbitAddresses = useDefaultSubplebbitAddresses();
  const { accountSubplebbits } = useAccountSubplebbits();
  const accountSubplebbitAddresses = useMemo(() => Object.keys(accountSubplebbits), [accountSubplebbits]);

  const account = useAccount();
  const subscriptions = useMemo(() => account?.subscriptions, [account?.subscriptions]);
  const reversedSubscriptions = useMemo(() => (subscriptions ? [...subscriptions].reverse() : []), [subscriptions]);

  const filteredSubplebbitAddresses = useMemo(() => subplebbitAddresses?.filter((address) => !subscriptions?.includes(address)), [subplebbitAddresses, subscriptions]);

  return (
        <CommunitiesDropdown />
        <TagFilterDropdown />
        <SortTypesDropdown />
        <TimeFilterDropdown />
            <li>
                {t('home')}
              </Link>
            </li>
            <li>
                {t('all')}
              </Link>
            </li>
            {accountSubplebbitAddresses.length > 0 && (
              <li>
                  {t('mod')}
                </Link>
              </li>
            )}
            {reversedSubscriptions?.map((subscription: string, index: number) => {
              const shortAddress = Plebbit.getShortAddress(subscription);
              const displayAddress = shortAddress.includes('.eth') ? shortAddress.slice(0, -4) : shortAddress.includes('.sol') ? shortAddress.slice(0, -4) : shortAddress;
              return (
                <li key={index}>
                    {displayAddress}
                  </Link>
                </li>
              );
            })}
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
                      {displayAddress}
                    </Link>
                  </li>
                );
              })}
          </ul>
        </div>
          {t('edit')} »
        </Link>
      </div>
    </div>
  );
});

export default TopBar;
