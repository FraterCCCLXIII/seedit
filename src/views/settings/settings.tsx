import { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { Trans, useTranslation } from 'react-i18next';
import { Capacitor } from '@capacitor/core';
import { setAccount, useAccount } from '@bitsocialnet/bitsocial-react-hooks';
import { isSettingsPlebbitOptionsView, isSettingsContentOptionsView } from '../../lib/utils/view-utils';
import useTheme from '../../hooks/use-theme';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { VersionWithCommit } from '../../components/version';
import AccountSettings from './account-settings';
import AddressSettings from './address-settings';
import AvatarSettings from './avatar-settings';
import PlebbitOptions from './plebbit-options';
import ContentOptions from './content-options';
import WalletSettings from './wallet-settings';
import NotificationsSettings from './notifications-settings';
import { feedShellMainProps } from '../../lib/feed-shell-data';
import { StandardPageContent } from '@/components/layout';
import { SettingsPage, SettingsSection } from './settings-section';
import { SettingsNav } from './settings-nav';
import styles from './settings.module.css';
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
          ? t('download_latest_desktop', { link: 'https://github.com/bitsocialhq/seedit/releases/latest', interpolation: { escapeValue: false } })
          : isAndroid
            ? t('download_latest_android')
            : t('refresh_to_update');
        if (isAndroid) {
          if (window.confirm(newVersionText + ' ' + updateActionText)) {
            window.open(`https://github.com/bitsocialhq/seedit/releases/download/v${packageData.version}/seedit-${packageData.version}.apk`, '_blank', 'noreferrer');
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
    <div className='text-sm text-muted-foreground'>
      <Trans
        i18nKey='check_for_updates'
        components={{
          1: <Button type='button' variant='link' size='sm' className='h-auto p-0' key='checkForUpdatesButton' onClick={checkForUpdates} disabled={loading} />,
        }}
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
    <div className='flex max-w-md flex-col gap-3'>
      <Select value={language} onChange={onSelectLanguage} aria-label={t('interface_language')}>
        {availableLanguages.map((lang) => (
          <option key={lang} value={lang}>
            {lang}
          </option>
        ))}
      </Select>
      <a
        className='text-sm text-primary underline-offset-4 hover:underline'
        href='https://github.com/bitsocialhq/seedit/tree/master/public/translations'
        target='_blank'
        rel='noopener noreferrer'
      >
        {t('contribute_on_github')}
      </a>
    </div>
  );
};

const ThemeSettings = () => {
  const [theme, setTheme] = useTheme();
  const { t } = useTranslation();

  return (
    <div className='max-w-xs'>
      <Select value={theme} onChange={(e) => setTheme(e.target.value)} aria-label={t('theme')}>
        <option value='light'>{t('light')}</option>
        <option value='dark'>{t('dark')}</option>
      </Select>
    </div>
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
    <div className='flex max-w-md flex-col gap-2 sm:flex-row sm:items-center'>
      <Input
        type='text'
        placeholder='My Name'
        value={displayName || account?.author?.displayName || ''}
        onChange={(e) => setDisplayName(e.target.value)}
        className='sm:max-w-xs'
        aria-label={t('display_name')}
      />
      <div className='flex items-center gap-2'>
        <Button type='button' variant='neutral' onClick={saveUsername}>
          {t('save')}
        </Button>
        {savedDisplayName && <span className='text-xs italic text-muted-foreground'>{t('saved')}</span>}
      </div>
    </div>
  );
};

const GeneralSettings = () => {
  const { t } = useTranslation();
  const location = useLocation();

  return (
    <SettingsPage>
      <SettingsSection title={t('version')}>
        <div className='space-y-2'>
          <div className={cn(styles.version, 'text-sm')}>
            <VersionWithCommit />
            {window.electronApi?.isElectron && (
              <a className='ml-2 text-xs text-primary underline-offset-4 hover:underline' href='http://localhost:50019/webui/' target='_blank' rel='noreferrer'>
                {t('node_stats')}
              </a>
            )}
          </div>
          <CheckForUpdates />
        </div>
      </SettingsSection>
      <SettingsSection title={t('interface_language')}>
        <LanguageSettings />
      </SettingsSection>
      <SettingsSection title={t('theme')}>
        <ThemeSettings />
      </SettingsSection>
      <SettingsSection title={t('avatar')}>
        <AvatarSettings />
      </SettingsSection>
      <SettingsSection title={t('display_name')} id='displayName' highlighted={location.hash === '#displayName'}>
        <DisplayNameSetting />
      </SettingsSection>
      <SettingsSection title={t('crypto_address')} id='cryptoAddress' highlighted={location.hash === '#cryptoAddress'}>
        <AddressSettings />
      </SettingsSection>
      <SettingsSection title={t('crypto_wallets')} id='cryptoWallets' highlighted={location.hash === '#cryptoWallets'}>
        <WalletSettings />
      </SettingsSection>
      <SettingsSection title={t('notifications')}>
        <NotificationsSettings />
      </SettingsSection>
      <SettingsSection title={t('account')} id='exportBackup' highlighted={location.hash === '#exportAccount'}>
        <AccountSettings />
      </SettingsSection>
    </SettingsPage>
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

  const settingsPageLabel = isInSettingsPlebbitOptionsView ? t('plebbit_options') : isInSettingsContentOptionsView ? t('content_options') : _.startCase(t('preferences'));
  const documentTitle = `${settingsPageLabel} - Seedit`;
  useEffect(() => {
    document.title = documentTitle;
  }, [documentTitle]);

  return (
    <div className={styles.content}>
      <div {...feedShellMainProps} className={styles.settingsShellMain} data-settings-shell>
        <StandardPageContent variant='flush'>
          <div className={styles.settingsLayout}>
            <SettingsNav />
            <div className={styles.settingsMain}>
              {isInSettingsPlebbitOptionsView ? <PlebbitOptions /> : isInSettingsContentOptionsView ? <ContentOptions /> : <GeneralSettings key={account?.id} />}
            </div>
          </div>
        </StandardPageContent>
      </div>
    </div>
  );
};

export default Settings;
