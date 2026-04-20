import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { PixelIcon } from '@/components/ui/pixel-icon';
import { Subplebbit, useSubplebbitStats } from '@bitsocialnet/bitsocial-react-hooks';
import { cn } from '@/lib/utils';
import SubscribeButton from '../subscribe-button';
import styles from './community-feed-header.module.css';

export type CommunityFeedHeaderProps = {
  subplebbit: Subplebbit | undefined;
  subplebbitAddress: string;
  /**
   * `feed` — inside `[data-feed-shell='main']` (full-bleed divider; main has no horizontal shell padding).
   * `shell` — inside `Header` / `headerArea` (span feed column; inset matches main padding).
   */
  placement?: 'feed' | 'shell';
};

/**
 * Feed header for community routes: avatar, name, member count, join/leave (shown above main column on mobile and desktop).
 */
const CommunityFeedHeader = ({ subplebbit, subplebbitAddress, placement = 'feed' }: CommunityFeedHeaderProps) => {
  const { t } = useTranslation();
  const { title, shortAddress, suggested } = subplebbit || {};
  const [avatarLoadFailed, setAvatarLoadFailed] = useState(false);
  const { allActiveUserCount, hourActiveUserCount } = useSubplebbitStats({ subplebbitAddress });

  useEffect(() => {
    setAvatarLoadFailed(false);
  }, [subplebbit?.address, suggested?.avatarUrl]);

  const displayId = subplebbitAddress?.includes('.') ? subplebbitAddress : shortAddress || subplebbitAddress;

  return (
    <header
      className={cn(styles.header, placement === 'feed' ? styles.headerFeed : styles.headerShell)}
      aria-label={t('community')}
    >
      <Link to={`/s/${subplebbitAddress}`} className={styles.avatarWrap}>
        {suggested?.avatarUrl && !avatarLoadFailed ? (
          <img
            src={suggested.avatarUrl}
            alt=''
            className={styles.avatarImg}
            onError={() => setAvatarLoadFailed(true)}
          />
        ) : (
          <span className={styles.avatarFallback} aria-hidden>
            <PixelIcon glyph='users' className={styles.avatarIcon} aria-hidden />
          </span>
        )}
      </Link>
      <div className={styles.body}>
        <div className={styles.titleRow}>
          <Link to={`/s/${subplebbitAddress}`} className={styles.titleLink}>
            <span className={styles.titlePrimary}>{title || `s/${displayId}`}</span>
            {title ? <span className={styles.titleAddress}>s/{displayId}</span> : null}
          </Link>
          <div className={styles.joinSlot}>
            <SubscribeButton address={subplebbitAddress} />
          </div>
        </div>
        <p className={styles.meta}>
          {t('members_count', { count: allActiveUserCount })}
          <span className={styles.metaSep} aria-hidden>
            {' · '}
          </span>
          {t('online_count_inline', { online: hourActiveUserCount ?? 0 })}
        </p>
      </div>
    </header>
  );
};

export default CommunityFeedHeader;
