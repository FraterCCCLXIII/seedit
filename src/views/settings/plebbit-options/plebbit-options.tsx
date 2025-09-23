import { RefObject, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useLocation } from 'react-router-dom';
import { setAccount, useAccount, usePlebbitRpcSettings } from '@plebbit/plebbit-react-hooks';

interface SettingsProps {
  ipfsGatewayUrlsRef?: RefObject<HTMLTextAreaElement>;
  mediaIpfsGatewayUrlRef?: RefObject<HTMLInputElement>;
  pubsubProvidersRef?: RefObject<HTMLTextAreaElement>;
  ethRpcRef?: RefObject<HTMLTextAreaElement>;
  solRpcRef?: RefObject<HTMLTextAreaElement>;
  maticRpcRef?: RefObject<HTMLTextAreaElement>;
  avaxRpcRef?: RefObject<HTMLTextAreaElement>;
  httpRoutersRef?: RefObject<HTMLTextAreaElement>;
  plebbitRpcRef?: RefObject<HTMLInputElement>;
  plebbitDataPathRef?: RefObject<HTMLInputElement>;
}

const IPFSGatewaysSettings = ({ ipfsGatewayUrlsRef, mediaIpfsGatewayUrlRef }: SettingsProps) => {
  const account = useAccount();
  const { plebbitOptions, mediaIpfsGatewayUrl } = account || {};
  const { ipfsGatewayUrls } = plebbitOptions || {};
  const ipfsGatewayUrlsDefaultValue = ipfsGatewayUrls?.join('\n');

  return (
        <textarea
          defaultValue={ipfsGatewayUrlsDefaultValue}
          ref={ipfsGatewayUrlsRef}
          autoCorrect='off'
          autoComplete='off'
          spellCheck='false'
          rows={ipfsGatewayUrls?.length || 3}
        />
      </div>
      <div>
        <input type='text' defaultValue={mediaIpfsGatewayUrl} ref={mediaIpfsGatewayUrlRef} />
      </div>
    </div>
  );
};

const PubsubProvidersSettings = ({ pubsubProvidersRef }: SettingsProps) => {
  const account = useAccount();
  const { plebbitOptions } = account || {};
  const { pubsubHttpClientsOptions } = plebbitOptions || {};
  const pubsubProvidersDefaultValue = pubsubHttpClientsOptions?.join('\n');

  return (
      <textarea
        defaultValue={pubsubProvidersDefaultValue}
        ref={pubsubProvidersRef}
        autoCorrect='off'
        autoComplete='off'
        spellCheck='false'
        rows={pubsubHttpClientsOptions?.length || 3}
      />
    </div>
  );
};

const HttpRoutersSettings = ({ httpRoutersRef }: SettingsProps) => {
  const account = useAccount();
  const { plebbitOptions } = account || {};
  const { httpRoutersOptions } = plebbitOptions || {};
  const httpRoutersDefaultValue = httpRoutersOptions?.join('\n');

  return (
      <textarea
        defaultValue={httpRoutersDefaultValue}
        ref={httpRoutersRef}
        autoCorrect='off'
        autoComplete='off'
        spellCheck='false'
        rows={httpRoutersOptions?.length || 4}
      />
    </div>
  );
};

const BlockchainProvidersSettings = ({ ethRpcRef, solRpcRef, maticRpcRef, avaxRpcRef }: SettingsProps) => {
  const account = useAccount();
  const { plebbitOptions } = account || {};
  const { chainProviders } = plebbitOptions || {};
  const ethRpcDefaultValue = chainProviders?.['eth']?.urls.join('\n');
  const solRpcDefaultValue = chainProviders?.['sol']?.urls.join('\n');
  const maticRpcDefaultValue = chainProviders?.['matic']?.urls.join('\n');
  const avaxRpcDefaultValue = chainProviders?.['avax']?.urls.join('\n');

  return (
      <div>
        <textarea defaultValue={ethRpcDefaultValue} ref={ethRpcRef} autoCorrect='off' autoComplete='off' spellCheck='false' rows={chainProviders?.['eth']?.length || 3} />
      </div>
      <div>
        <textarea defaultValue={solRpcDefaultValue} ref={solRpcRef} autoCorrect='off' autoComplete='off' spellCheck='false' rows={chainProviders?.['sol']?.length || 1} />
      </div>
      <div>
        <textarea
          defaultValue={maticRpcDefaultValue}
          ref={maticRpcRef}
          autoCorrect='off'
          autoComplete='off'
          spellCheck='false'
          rows={chainProviders?.['matic']?.length || 1}
        />
      </div>
      <div>
        <textarea
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
  const [showInfo, setShowInfo] = useState(false);
  const account = useAccount();
  const { plebbitOptions } = account || {};
  const { plebbitRpcClientsOptions } = plebbitOptions || {};

  return (
      <div>
        <input autoCorrect='off' autoCapitalize='off' spellCheck='false' type='text' defaultValue={plebbitRpcClientsOptions} ref={plebbitRpcRef} />
        <button onClick={() => setShowInfo(!showInfo)}>{showInfo ? 'X' : '?'}</button>
      </div>
      {showInfo && (
          use a plebbit full node locally, or remotely with SSL
          <br />
          <ol>
            <li>get secret auth key from the node</li>
            <li>get IP address and port used by the node</li>
            <li>
              enter: <code>{`ws://<IP>:<port>/<secretAuthKey>`}</code>
            </li>
            <li>click save to connect</li>
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
        <input autoCorrect='off' autoCapitalize='off' spellCheck='false' type='text' defaultValue={path} disabled={!isConnectedToRpc} ref={plebbitDataPathRef} />
      </div>
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

    const pubsubHttpClientsOptions = pubsubProvidersRef.current?.value
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
    if (pubsubHttpClientsOptions?.length) newPlebbitOptions.pubsubHttpClientsOptions = pubsubHttpClientsOptions;
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
      alert('Options saved, reloading...');
      window.location.reload();
    } catch (e) {
      if (e instanceof Error) {
        alert('Error saving options: ' + e.message);
        console.log(e);
      } else {
        alert('Error');
      }
    }
  };

  return (
          <IPFSGatewaysSettings ipfsGatewayUrlsRef={ipfsGatewayUrlsRef} mediaIpfsGatewayUrlRef={mediaIpfsGatewayUrlRef} />
        </span>
      </div>
          <PubsubProvidersSettings pubsubProvidersRef={pubsubProvidersRef} />
        </span>
      </div>
          <HttpRoutersSettings httpRoutersRef={httpRoutersRef} />
        </span>
      </div>
          <BlockchainProvidersSettings ethRpcRef={ethRpcRef} solRpcRef={solRpcRef} maticRpcRef={maticRpcRef} avaxRpcRef={avaxRpcRef} />
        </span>
      </div>
          <PlebbitRPCSettings plebbitRpcRef={plebbitRpcRef} />
        </span>
      </div>
      {isElectron && (
            <PlebbitDataPathSettings plebbitDataPathRef={plebbitDataPathRef} />
          </span>
        </div>
      )}
        {t('save_options')}
      </button>
    </div>
  );
};

export default PlebbitOptions;
