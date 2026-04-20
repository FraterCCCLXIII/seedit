import { RefObject, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { setAccount, useAccount, usePlebbitRpcSettings } from '@bitsocialnet/bitsocial-react-hooks';
import { cn } from '@/lib/utils';
import { SettingsPage, SettingsPageActions, SettingsSection } from '../settings-section';
import styles from './plebbit-options.module.css';

interface SettingsProps {
  ipfsGatewayUrlsRef?: RefObject<HTMLTextAreaElement | null>;
  mediaIpfsGatewayUrlRef?: RefObject<HTMLInputElement | null>;
  pubsubProvidersRef?: RefObject<HTMLTextAreaElement | null>;
  ethRpcRef?: RefObject<HTMLTextAreaElement | null>;
  solRpcRef?: RefObject<HTMLTextAreaElement | null>;
  maticRpcRef?: RefObject<HTMLTextAreaElement | null>;
  avaxRpcRef?: RefObject<HTMLTextAreaElement | null>;
  httpRoutersRef?: RefObject<HTMLTextAreaElement | null>;
  plebbitRpcRef?: RefObject<HTMLInputElement | null>;
  plebbitDataPathRef?: RefObject<HTMLInputElement | null>;
}

const IPFSGatewaysSettings = ({ ipfsGatewayUrlsRef, mediaIpfsGatewayUrlRef }: SettingsProps) => {
  const { t } = useTranslation();
  const account = useAccount();
  const { plebbitOptions, mediaIpfsGatewayUrl } = account || {};
  const { ipfsGatewayUrls } = plebbitOptions || {};
  const ipfsGatewayUrlsDefaultValue = ipfsGatewayUrls?.join('\n');

  return (
    <div className='space-y-4'>
      <div>
        <Textarea
          className='max-w-2xl'
          defaultValue={ipfsGatewayUrlsDefaultValue}
          ref={ipfsGatewayUrlsRef}
          autoCorrect='off'
          autoComplete='off'
          spellCheck='false'
          rows={ipfsGatewayUrls?.length || 3}
        />
      </div>
      <div className='space-y-2'>
        <p className='text-sm italic text-muted-foreground'>{t('nft_profile_pics_gateway')}</p>
        <Input className='max-w-md' type='text' defaultValue={mediaIpfsGatewayUrl} ref={mediaIpfsGatewayUrlRef} />
      </div>
    </div>
  );
};

const PubsubProvidersSettings = ({ pubsubProvidersRef }: SettingsProps) => {
  const account = useAccount();
  const { plebbitOptions } = account || {};
  const { pubsubKuboRpcClientsOptions } = plebbitOptions || {};
  const pubsubProvidersDefaultValue = pubsubKuboRpcClientsOptions?.join('\n');

  return (
    <Textarea
      className='max-w-2xl'
      defaultValue={pubsubProvidersDefaultValue}
      ref={pubsubProvidersRef}
      autoCorrect='off'
      autoComplete='off'
      spellCheck='false'
      rows={pubsubKuboRpcClientsOptions?.length || 3}
    />
  );
};

const HttpRoutersSettings = ({ httpRoutersRef }: SettingsProps) => {
  const account = useAccount();
  const { plebbitOptions } = account || {};
  const { httpRoutersOptions } = plebbitOptions || {};
  const httpRoutersDefaultValue = httpRoutersOptions?.join('\n');

  return (
    <Textarea
      className='max-w-2xl'
      defaultValue={httpRoutersDefaultValue}
      ref={httpRoutersRef}
      autoCorrect='off'
      autoComplete='off'
      spellCheck='false'
      rows={httpRoutersOptions?.length || 4}
    />
  );
};

const BlockchainProvidersSettings = ({ ethRpcRef, solRpcRef, maticRpcRef, avaxRpcRef }: SettingsProps) => {
  const { t } = useTranslation();
  const account = useAccount();
  const { plebbitOptions } = account || {};
  const { chainProviders } = plebbitOptions || {};
  const ethRpcDefaultValue = chainProviders?.['eth']?.urls.join('\n');
  const solRpcDefaultValue = chainProviders?.['sol']?.urls.join('\n');
  const maticRpcDefaultValue = chainProviders?.['matic']?.urls.join('\n');
  const avaxRpcDefaultValue = chainProviders?.['avax']?.urls.join('\n');

  return (
    <div className='space-y-4'>
      <div className='space-y-2'>
        <p className='text-sm italic text-muted-foreground'>{t('ethereum_rpc_for_eth_addresses')}</p>
        <Textarea
          className='max-w-2xl'
          defaultValue={ethRpcDefaultValue}
          ref={ethRpcRef}
          autoCorrect='off'
          autoComplete='off'
          spellCheck='false'
          rows={chainProviders?.['eth']?.length || 3}
        />
      </div>
      <div className='space-y-2'>
        <p className='text-sm italic text-muted-foreground'>{t('solana_rpc_for_sol_addresses')}</p>
        <Textarea
          className='max-w-2xl'
          defaultValue={solRpcDefaultValue}
          ref={solRpcRef}
          autoCorrect='off'
          autoComplete='off'
          spellCheck='false'
          rows={chainProviders?.['sol']?.length || 1}
        />
      </div>
      <div className='space-y-2'>
        <p className='text-sm italic text-muted-foreground'>{t('polygon_rpc_for_nft_profile_pics')}</p>
        <Textarea
          className='max-w-2xl'
          defaultValue={maticRpcDefaultValue}
          ref={maticRpcRef}
          autoCorrect='off'
          autoComplete='off'
          spellCheck='false'
          rows={chainProviders?.['matic']?.length || 1}
        />
      </div>
      <div className='space-y-2'>
        <p className='text-sm italic text-muted-foreground'>{t('avalanche_rpc')}</p>
        <Textarea
          className='max-w-2xl'
          defaultValue={avaxRpcDefaultValue}
          ref={avaxRpcRef}
          autoCorrect='off'
          autoComplete='off'
          spellCheck='false'
          rows={chainProviders?.['avax']?.length || 1}
        />
      </div>
    </div>
  );
};

const PlebbitRPCSettings = ({ plebbitRpcRef }: SettingsProps) => {
  const { t } = useTranslation();
  const [showInfo, setShowInfo] = useState(false);
  const account = useAccount();
  const { plebbitOptions } = account || {};
  const { plebbitRpcClientsOptions } = plebbitOptions || {};

  return (
    <div className='space-y-3'>
      <div className='flex max-w-md flex-wrap items-start gap-2'>
        <Input
          className='min-w-0 flex-1'
          autoCorrect='off'
          autoCapitalize='off'
          spellCheck='false'
          type='text'
          defaultValue={plebbitRpcClientsOptions}
          ref={plebbitRpcRef}
        />
        <Button type='button' variant='outline' size='icon' onClick={() => setShowInfo(!showInfo)} aria-expanded={showInfo} aria-label={showInfo ? t('close') : t('help')}>
          {showInfo ? '×' : '?'}
        </Button>
      </div>
      {showInfo && (
        <div className={cn(styles.plebbitRpcHelp, 'text-sm text-muted-foreground')}>
          <p>{t('plebbit_rpc_help_intro')}</p>
          <ol className='mt-2 list-decimal space-y-1 pl-5'>
            <li>{t('plebbit_rpc_help_step1')}</li>
            <li>{t('plebbit_rpc_help_step2')}</li>
            <li>{t('plebbit_rpc_help_step3')}</li>
            <li>{t('plebbit_rpc_help_step4')}</li>
          </ol>
        </div>
      )}
    </div>
  );
};

const PlebbitDataPathSettings = ({ plebbitDataPathRef }: SettingsProps) => {
  const plebbitRpc = usePlebbitRpcSettings();
  const { plebbitRpcSettings } = plebbitRpc || {};
  const isConnectedToRpc = plebbitRpc?.state === 'connected';
  const path = plebbitRpcSettings?.plebbitOptions?.dataPath || '';

  return (
    <div>
      <Input
        className='max-w-md'
        autoCorrect='off'
        autoCapitalize='off'
        spellCheck='false'
        type='text'
        defaultValue={path}
        disabled={!isConnectedToRpc}
        ref={plebbitDataPathRef}
      />
    </div>
  );
};

const isElectron = window.electronApi?.isElectron === true;

const PlebbitOptions = () => {
  const { t } = useTranslation();
  const location = useLocation();
  const account = useAccount();
  const { plebbitOptions } = account || {};

  const ipfsGatewayUrlsRef = useRef<HTMLTextAreaElement>(null);
  const mediaIpfsGatewayUrlRef = useRef<HTMLInputElement>(null);
  const pubsubProvidersRef = useRef<HTMLTextAreaElement>(null);
  const ethRpcRef = useRef<HTMLTextAreaElement>(null);
  const solRpcRef = useRef<HTMLTextAreaElement>(null);
  const maticRpcRef = useRef<HTMLTextAreaElement>(null);
  const avaxRpcRef = useRef<HTMLTextAreaElement>(null);
  const httpRoutersRef = useRef<HTMLTextAreaElement>(null);
  const plebbitRpcRef = useRef<HTMLInputElement>(null);
  const plebbitDataPathRef = useRef<HTMLInputElement>(null);

  const handleSave = async () => {
    const ipfsGatewayUrls = ipfsGatewayUrlsRef.current?.value
      .split('\n')
      .map((url) => url.trim())
      .filter((url) => url !== '');

    const mediaIpfsGatewayUrl = mediaIpfsGatewayUrlRef.current?.value.trim() || undefined;

    const pubsubKuboRpcClientsOptions = pubsubProvidersRef.current?.value
      .split('\n')
      .map((url) => url.trim())
      .filter((url) => url !== '');

    const ethRpcUrls = ethRpcRef.current?.value
      .split('\n')
      .map((url) => url.trim())
      .filter((url) => url !== '');

    const solRpcUrls = solRpcRef.current?.value
      .split('\n')
      .map((url) => url.trim())
      .filter((url) => url !== '');

    const maticRpcUrls = maticRpcRef.current?.value
      .split('\n')
      .map((url) => url.trim())
      .filter((url) => url !== '');

    const avaxRpcUrls = avaxRpcRef.current?.value
      .split('\n')
      .map((url) => url.trim())
      .filter((url) => url !== '');

    const httpRoutersOptions = httpRoutersRef.current?.value
      .split('\n')
      .map((url) => url.trim())
      .filter((url) => url !== '');

    const plebbitRpcValue = plebbitRpcRef.current?.value.trim();
    const plebbitRpcClientsOptions = plebbitRpcValue ? [plebbitRpcValue] : undefined;
    const dataPath = plebbitDataPathRef.current?.value.trim() || undefined;

    const chainProviders: any = {};
    if (ethRpcUrls?.length) chainProviders.eth = { urls: ethRpcUrls, chainId: 1 };
    if (solRpcUrls?.length) chainProviders.sol = { urls: solRpcUrls, chainId: 1 };
    if (maticRpcUrls?.length) chainProviders.matic = { urls: maticRpcUrls, chainId: 137 };
    if (avaxRpcUrls?.length) chainProviders.avax = { urls: avaxRpcUrls, chainId: 43114 };

    const newPlebbitOptions: any = {};
    if (ipfsGatewayUrls?.length) newPlebbitOptions.ipfsGatewayUrls = ipfsGatewayUrls;
    if (pubsubKuboRpcClientsOptions?.length) newPlebbitOptions.pubsubKuboRpcClientsOptions = pubsubKuboRpcClientsOptions;
    if (httpRoutersOptions?.length) newPlebbitOptions.httpRoutersOptions = httpRoutersOptions;
    if (plebbitRpcClientsOptions) newPlebbitOptions.plebbitRpcClientsOptions = plebbitRpcClientsOptions;
    if (dataPath) newPlebbitOptions.dataPath = dataPath;
    if (Object.keys(chainProviders)?.length) newPlebbitOptions.chainProviders = chainProviders;

    const updatedPlebbitOptions = { ...plebbitOptions, ...newPlebbitOptions };

    const updatedAccount: any = { ...account };
    if (mediaIpfsGatewayUrl) {
      updatedAccount.mediaIpfsGatewayUrl = mediaIpfsGatewayUrl;
    } else {
      delete updatedAccount.mediaIpfsGatewayUrl;
    }

    updatedAccount.plebbitOptions = updatedPlebbitOptions;

    try {
      await setAccount(updatedAccount);
      alert(t('options_saved_reloading'));
      window.location.reload();
    } catch (e) {
      if (e instanceof Error) {
        alert(t('error_saving_options', { message: e.message }));
        console.log(e);
      } else {
        alert(t('generic_error'));
      }
    }
  };

  return (
    <SettingsPage>
      <SettingsSection title={t('ipfs_gateways')}>
        <IPFSGatewaysSettings ipfsGatewayUrlsRef={ipfsGatewayUrlsRef} mediaIpfsGatewayUrlRef={mediaIpfsGatewayUrlRef} />
      </SettingsSection>
      <SettingsSection title={t('pubsub_providers')}>
        <PubsubProvidersSettings pubsubProvidersRef={pubsubProvidersRef} />
      </SettingsSection>
      <SettingsSection title={t('http_routers')}>
        <HttpRoutersSettings httpRoutersRef={httpRoutersRef} />
      </SettingsSection>
      <SettingsSection title={t('blockchain_providers')}>
        <BlockchainProvidersSettings ethRpcRef={ethRpcRef} solRpcRef={solRpcRef} maticRpcRef={maticRpcRef} avaxRpcRef={avaxRpcRef} />
      </SettingsSection>
      <SettingsSection title={t('plebbit_rpc')} id='plebbitRpc' highlighted={location.hash === '#plebbitRpc'}>
        <PlebbitRPCSettings plebbitRpcRef={plebbitRpcRef} />
      </SettingsSection>
      {isElectron && (
        <SettingsSection title={t('plebbit_data_path')}>
          <PlebbitDataPathSettings plebbitDataPathRef={plebbitDataPathRef} />
        </SettingsSection>
      )}
      <SettingsPageActions>
        <Button type='button' variant='neutral' onClick={handleSave}>
          {t('save_options')}
        </Button>
      </SettingsPageActions>
    </SettingsPage>
  );
};

export default PlebbitOptions;
