import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
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
      <img src='assets/over18.png' alt='over 18' />
        <h3>{t('must_be_over_18')}</h3>
        <p>{t('must_be_over_18_explanation')}</p>
      </div>
        <button>
          <Link to='/'>{t('no_thank_you')}</Link>
        </button>
        <button onClick={handleAcceptWarning}>{t('continue')}</button>
      </div>
    </div>
  );
};

export default Over18Warning;
