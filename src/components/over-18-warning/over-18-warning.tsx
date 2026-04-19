import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import styles from './over-18-warning.module.css';
import useContentOptionsStore from '../../stores/use-content-options-store';

const Over18Warning = () => {
  const { t } = useTranslation();
  const contentOptionsStore = useContentOptionsStore();

  const handleAcceptWarning = () => {
    contentOptionsStore.setHideAdultCommunities(false);
    contentOptionsStore.setHideGoreCommunities(false);
    contentOptionsStore.setHideAntiCommunities(false);
    contentOptionsStore.setHideVulgarCommunities(false);
    contentOptionsStore.setHasAcceptedWarning(true);
  };

  return (
    <div className={styles.over18}>
      <img src='assets/over18.png' alt='over 18' />
      <div className={styles.warning}>
        <h3>{t('must_be_over_18')}</h3>
        <p>{t('must_be_over_18_explanation')}</p>
      </div>
      <div className={styles.warningButtons}>
        <Button variant='outline' asChild>
          <Link to='/'>{t('no_thank_you')}</Link>
        </Button>
        <Button type='button' onClick={handleAcceptWarning}>
          {t('continue')}
        </Button>
      </div>
    </div>
  );
};

export default Over18Warning;
