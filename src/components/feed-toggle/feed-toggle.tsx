import React from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';

interface FeedToggleProps {
  mode: 'subscribed' | 'all';
  onModeChange: (mode: 'subscribed' | 'all') => void;
}

const FeedToggle = ({ mode, onModeChange }: FeedToggleProps) => {
  const { t } = useTranslation();

  return (
    <div className={styles.toggleContainer}>
      <div className={styles.toggleWrapper}>
        <button className={`${styles.toggleButton} ${mode === 'subscribed' ? styles.active : ''}`} onClick={() => onModeChange('subscribed')} type='button'>
          {t('subscribed')}
        </button>
        <button className={`${styles.toggleButton} ${mode === 'all' ? styles.active : ''}`} onClick={() => onModeChange('all')} type='button'>
          {t('all')}
        </button>
      </div>
    </div>
  );
};

export default FeedToggle;

