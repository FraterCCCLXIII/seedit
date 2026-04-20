import { useLocation, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Select } from '@/components/ui/select';
import { isSubplebbitsVoteView } from '@/lib/utils/view-utils';
import {
  MY_COMMUNITIES_ROUTES,
  VOTE_ROUTES,
  getMyCommunitiesTab,
  getVoteTab,
  type MyCommunitiesTab,
  type VoteTab,
} from '@/lib/subplebbits-list-filters';
import styles from './subplebbits-header-filter.module.css';

export function SubplebbitsHeaderFilter() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  const pathname = location.pathname;

  if (isSubplebbitsVoteView(pathname)) {
    const tab = getVoteTab(pathname);
    return (
      <div className={styles.filterWrap}>
        <div className={styles.filterControl}>
          <Select
            value={tab}
            onChange={(e) => navigate(VOTE_ROUTES[e.target.value as VoteTab])}
            aria-label={t('vote_filter')}
          >
            <option value='all'>{t('all')}</option>
            <option value='passing' disabled>
              {t('passing')}
            </option>
            <option value='rejecting' disabled>
              {t('rejecting')}
            </option>
          </Select>
        </div>
      </div>
    );
  }

  const tab = getMyCommunitiesTab(pathname);
  return (
    <div className={styles.filterWrap}>
      <div className={styles.filterControl}>
        <Select
          value={tab}
          onChange={(e) => navigate(MY_COMMUNITIES_ROUTES[e.target.value as MyCommunitiesTab])}
          aria-label={t('communities_filter')}
        >
          <option value='all'>{t('all')}</option>
          <option value='subscriber'>{t('subscriber')}</option>
          <option value='moderator'>{t('moderator')}</option>
          <option value='admin'>{t('admin')}</option>
          <option value='owner'>{t('owner')}</option>
        </Select>
      </div>
    </div>
  );
}
