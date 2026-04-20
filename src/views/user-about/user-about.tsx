import { useEffect } from 'react';
import { Link, useLocation, useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  useAccount,
  useAccountSubplebbits,
  AccountSubplebbit,
  useAuthor,
  useSubplebbits,
} from '@bitsocialnet/bitsocial-react-hooks';
import Plebbit from '@plebbit/plebbit-js';
import { StandardPageContent } from '@/components/layout';
import { feedShellMainProps, feedShellSidebarProps } from '../../lib/feed-shell-data';
import { findAuthorSubplebbits } from '../../lib/utils/user-utils';
import { useDefaultSubplebbitAddresses } from '../../hooks/use-default-subplebbits';
import { isProfileAboutView } from '../../lib/utils/view-utils';
import AuthorFeedSidebar from '../../components/author-feed-sidebar';
import styles from './user-about.module.css';

const ModeratesSection = ({
  addresses,
  emptyLabel,
}: {
  addresses: string[];
  emptyLabel: string;
}) => {
  const { t } = useTranslation();

  return (
    <section className={styles.moderatorCard} aria-labelledby='user-about-moderates-heading'>
      <h2 id='user-about-moderates-heading' className={styles.moderatorHeading}>
        {t('moderator_of_heading', { defaultValue: 'Moderator of' })}
      </h2>
      {addresses.length === 0 ? (
        <p className={styles.emptyNote}>{emptyLabel}</p>
      ) : (
        <ul className={styles.moderatorList}>
          {addresses.map((address) => (
            <li key={address}>
              <Link to={`/s/${address}`}>s/{Plebbit.getShortAddress({ address })}</Link>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
};

const UserAbout = () => {
  const { t } = useTranslation();
  const { authorAddress, commentCid } = useParams();
  const { pathname } = useLocation();
  const isProfile = isProfileAboutView(pathname);

  const userAccount = useAccount();
  const { accountSubplebbits } = useAccountSubplebbits();
  const defaultSubplebbitAddresses = useDefaultSubplebbitAddresses();
  const accountSubscriptions = userAccount?.subscriptions || [];
  const subscriptionsAndDefaults = [...accountSubscriptions, ...defaultSubplebbitAddresses];
  const subplebbits =
    useSubplebbits({
      subplebbitAddresses: subscriptionsAndDefaults || [],
      onlyIfCached: true,
    }).subplebbits?.filter(Boolean) || [];

  const authorAccount = useAuthor({
    authorAddress: isProfile ? userAccount?.author?.address : authorAddress,
    commentCid: isProfile ? undefined : commentCid,
  });
  const authorSubplebbits = findAuthorSubplebbits(authorAddress ?? '', Object.values(subplebbits));
  const profileAddresses = [...new Set(Object.keys(accountSubplebbits as Record<string, AccountSubplebbit>))];
  const authorAddresses = [...new Set(authorSubplebbits)];

  const displayAddresses = isProfile ? profileAddresses : authorAddresses;

  const titleShort = isProfile
    ? userAccount?.author?.shortAddress || ''
    : authorAccount?.author?.shortAddress || Plebbit.getShortAddress({ address: authorAddress || '' });

  useEffect(() => {
    document.title = (titleShort ? `u/${titleShort} — ${t('about')} — Seedit` : `${t('about')} — Seedit`);
  }, [t, titleShort]);

  return (
    <div className={styles.content}>
      <div {...feedShellMainProps} className={styles.mainColumn}>
        <StandardPageContent variant='full'>
          <ModeratesSection
            addresses={displayAddresses}
            emptyLabel={t('user_about_no_moderates', { defaultValue: 'Not a moderator of any community yet.' })}
          />
        </StandardPageContent>
      </div>
      <div className={styles.sidebarColumn} {...feedShellSidebarProps}>
        <AuthorFeedSidebar />
      </div>
    </div>
  );
};

export default UserAbout;
