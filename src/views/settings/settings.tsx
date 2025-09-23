import { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { Trans, useTranslation } from 'react-i18next';
import { Capacitor } from '@capacitor/core';
import { setAccount, useAccount } from '@plebbit/plebbit-react-hooks';
import { isSettingsPlebbitOptionsView, isSettingsContentOptionsView } from '../../lib/utils/view-utils';
import useTheme from '../../hooks/use-theme';
import { VersionWithCommit } from '../../components/version';
import AccountSettings from './account-settings';
import AddressSettings from './address-settings';
import AvatarSettings from './avatar-settings';
import PlebbitOptions from './plebbit-options';
import ContentOptions from './content-options';
import WalletSettings from './wallet-settings';
import NotificationsSettings from './notifications-settings';
import packageJson from '../../../package.json';
import _ from 'lodash';

const commitRef = import.meta.env.VITE_COMMIT_REF;
const isAndroid = Capacitor.getPlatform() === 'android';

const CheckForUpdates = () => {
  const { t } = useTranslation();
  const [loading, setLoading] = useState(false);

  const checkForUpdates = async () => {
    try {
      setLoading(true);
      const packageRes = await fetch('https://raw.githubusercontent.com/plebbit/seedit/master/package.json', { cache: 'no-cache' });
      const packageData = await packageRes.json();
      let updateAvailable = false;

      if (packageJson.version !== packageData.version) {
        const newVersionText = t('new_stable_version', { newVersion: packageData.version, oldVersion: packageJson.version });
        const updateActionText = window.electronApi?.isElectron
          ? t('download_latest_desktop', { link: 'https://github.com/plebbit/seedit/releases/latest', interpolation: { escapeValue: false } })
          : isAndroid
          ? t('download_latest_android')
          : t('refresh_to_update');
        if (isAndroid) {
          if (window.confirm(newVersionText + ' ' + updateActionText)) {
            window.open(`https://github.com/plebbit/seedit/releases/download/v${packageData.version}/seedit-${packageData.version}.apk`, '_blank', 'noreferrer');
          }
        } else {
          alert(newVersionText + ' ' + updateActionText);
        }
        updateAvailable = true;
      }

      if (commitRef && commitRef.length > 0) {
        const commitRes = await fetch('https://api.github.com/repos/plebbit/seedit/commits?per_page=1&sha=development', { cache: 'no-cache' });
        const commitData = await commitRes.json();

        const latestCommitHash = commitData[0].sha;

        if (latestCommitHash.trim() !== commitRef.trim()) {
          const newVersionText =
            t('new_development_version', { newCommit: latestCommitHash.slice(0, 7), oldCommit: commitRef.slice(0, 7) }) + ' ' + t('refresh_to_update');
          alert(newVersionText);
          updateAvailable = true;
        }
      }

      if (!updateAvailable) {
        alert(
          commitRef
            ? `${t('latest_development_version', { commit: commitRef.slice(0, 7), link: 'https://seedit.eth.limo/#/', interpolation: { escapeValue: false } })}`
            : `${t('latest_stable_version', { version: packageJson.version })}`,
        );
      }
    } catch (error) {
      alert('Failed to fetch latest version info: ' + error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <Trans
        i18nKey='check_for_updates'
      />
    </div>
  );
};

// prettier-ignore
const availableLanguages = ['ar', 'bn', 'cs', 'da', 'de', 'el', 'en', 'es', 'fa', 'fi', 'fil', 'fr', 'he', 'hi', 'hu', 'id', 'it', 'ja', 'ko', 'mr', 'nl', 'no', 'pl', 'pt', 'ro', 'ru', 'sq', 'sv', 'te', 'th', 'tr', 'uk', 'ur', 'vi', 'zh'];

const LanguageSettings = () => {
  const { t, i18n } = useTranslation();
  const { changeLanguage, language } = i18n;

  const onSelectLanguage = (e: React.ChangeEvent<HTMLSelectElement>) => {
    changeLanguage(e.target.value);
    window.location.reload();
  };

  return (
      <select value={language} onChange={onSelectLanguage}>
        {availableLanguages.map((lang) => (
          <option key={lang} value={lang}>
            {lang}
          </option>
        ))}
      </select>
      <a href='https://github.com/plebbit/seedit/tree/master/public/translations' target='_blank' rel='noopener noreferrer'>
        {t('contribute_on_github')}
      </a>

    </div>
  );
};

const ThemeSettings = () => {
  const [theme, setTheme] = useTheme();
  const { t } = useTranslation();

  return (
    <select value={theme} onChange={(e) => setTheme(e.target.value)}>
      <option value='light'>{t('light')}</option>
      <option value='dark'>{t('dark')}</option>
    </select>
  );
};

const DisplayNameSetting = () => {
  const { t } = useTranslation();
  const account = useAccount();
  const [displayName, setDisplayName] = useState(account?.author?.displayName || '');
  const [savedDisplayName, setSavedDisplayName] = useState(false);

  const saveUsername = async () => {
    try {
      await setAccount({ ...account, author: { ...account?.author, displayName } });
      setSavedDisplayName(true);
    } catch (error) {
      if (error instanceof Error) {
        alert(error.message);
        console.log(error);
      } else {
        console.error('An unknown error occurred:', error);
      }
    }
  };

  return (
        <input type='text' placeholder='My Name' value={displayName || account?.author?.displayName || ''} onChange={(e) => setDisplayName(e.target.value)} />
          {t('save')}
        </button>

    </div>

    </div>
  );
};

const GeneralSettings = () => {
  const { t } = useTranslation();
  const location = useLocation();

  return (
    <>
            <VersionWithCommit />
            {window.electronApi?.isElectron && (
                {t('node_stats')}
              </a>
            )}

    </div>
          <CheckForUpdates />

    </span>

    </div>
          <LanguageSettings />

    </span>

    </div>
          <ThemeSettings />

    </span>

    </div>
          <AvatarSettings />

    </span>

    </div>
          <DisplayNameSetting />

    </span>

    </div>
          <AddressSettings />

    </span>

    </div>
          <WalletSettings />

    </span>

    </div>
          <NotificationsSettings />

    </span>

    </div>
          <AccountSettings />

    </span>

    </div>
    </>
  );
};

const Settings = () => {
  const { t } = useTranslation();
  const location = useLocation();
  const isInSettingsPlebbitOptionsView = isSettingsPlebbitOptionsView(location.pathname);
  const isInSettingsContentOptionsView = isSettingsContentOptionsView(location.pathname);
  const account = useAccount();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const documentTitle = `${_.startCase(t('preferences'))} - Seedit`;
  useEffect(() => {
    document.title = documentTitle;
  }, [documentTitle]);

  return (
      {isInSettingsPlebbitOptionsView ? <PlebbitOptions /> : isInSettingsContentOptionsView ? <ContentOptions /> : <GeneralSettings key={account?.id} />}

    </div>
  );
};

export default Settings;
