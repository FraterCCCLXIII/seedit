import { useCallback, useEffect, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { Trans, useTranslation } from 'react-i18next';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useAccount, usePublishComment, useSubplebbit } from '@plebbit/plebbit-react-hooks';
import Plebbit from '@plebbit/plebbit-js';
import { Capacitor } from '@capacitor/core';
import FileUploader from '../../plugins/file-uploader';
import { getLinkMediaInfo } from '../../lib/utils/media-utils';
import { isValidURL } from '../../lib/utils/url-utils';
import usePublishPostStore from '../../stores/use-publish-post-store';
import { useDefaultSubplebbitAddresses } from '../../hooks/use-default-subplebbits';
import useIsSubplebbitOffline from '../../hooks/use-is-subplebbit-offline';
import LoadingEllipsis from '../../components/loading-ellipsis';
import Markdown from '../../components/markdown';
import Embed from '../../components/post/embed';
import { FormattingHelpTable } from '../../components/reply-form/reply-form';
import InfoTooltip from '../../components/info-tooltip';

const isAndroid = Capacitor.getPlatform() === 'android';
const isElectron = window.electronApi?.isElectron === true;

const UrlField = () => {
  const { t } = useTranslation();
  const { link: url, setPublishPostStore } = usePublishPostStore();
  const [mediaError, setMediaError] = useState(false);

  const mediaInfo = url ? getLinkMediaInfo(url) : null;
  const mediaType = mediaInfo?.type;

  let mediaComponent;

  if (mediaType === 'image' || mediaType === 'gif') {
    mediaComponent = <img src={url} alt='' onError={() => setMediaError(true)} />;
  } else if (mediaType === 'video') {
    mediaComponent = <video src={url} controls />;
  } else if (mediaType === 'webpage') {
    mediaComponent = <></>;
  } else if (mediaType === 'audio') {
    mediaComponent = <audio src={url} controls />;
  } else if (mediaType === 'iframe') {
    mediaComponent = <Embed url={url || ''} />;
  } else if (mediaType === 'pdf') {
    mediaComponent = <Embed url={url || ''} />;
  }

  return (
    <div>
      {url && isValidURL(url) ? (
        <div>
          {/* URL preview content */}
        </div>
      ) : (
        <>
          {/* Form content */}
        </>
      )}
      {url && (
        <span>
          x
        </span>
      )}
      <input
        type='text'
          value={url ?? ''}
          autoCorrect='off'
          autoComplete='off'
          spellCheck='false'
          onChange={(e) => {
            setPublishPostStore({ link: e.target.value });
            setMediaError(false);
          }}
        />
        {url && isValidURL(url) ? (
          <div>
            {/* URL preview or validation message */}
          </div>
        ) : (
          <div>
            {t('submit_url_description')}
            <InfoTooltip
              content={`Seedit also supports links from the following sites: YouTube, Twitter/X, Reddit, Twitch, TikTok, Instagram, Odysee, Bitchute, Streamable, Spotify, and SoundCloud.`}
            />
          </div>
        )}
      </div>
    </div>
  );
};

const UploadMediaForm = () => {
  const { t } = useTranslation();
  const { setPublishPostStore } = usePublishPostStore();

  // on android or electron, auto upload file to image hosting sites with open api
  const [isUploading, setIsUploading] = useState(false);
  const [isChoosingFile, setIsChoosingFile] = useState(false);

  const onDrop = useCallback(
    async (acceptedFiles: File[]) => {
      if (!(isAndroid || isElectron)) {
        if (window.confirm(t('upload_button_warning'))) {
          const link = document.createElement('a');
          link.href = 'https://github.com/plebbit/seedit/releases/latest';
          link.target = '_blank';
          link.rel = 'noopener noreferrer';
          link.click();
        }
        return;
      }

      if (acceptedFiles.length > 0) {
        try {
          setIsChoosingFile(false);
          setIsUploading(true);

          // for Electron, we need to convert the File to a format that can be sent via IPC
          if (isElectron) {
            const file = acceptedFiles[0];
            const reader = new FileReader();

            const fileData = await new Promise((resolve, reject) => {
              reader.onload = () => {
                const base64data = reader.result?.toString().split(',')[1];
                resolve({
                  fileData: base64data,
                  fileName: file.name,
                });
              };
              reader.onerror = reject;
              reader.readAsDataURL(file);
            });

            const result = await FileUploader.uploadMedia(fileData as { fileData?: string; fileName: string });
            if (result.url) {
              setPublishPostStore({ link: result.url || undefined });
            }
          } else if (isAndroid) {
            // android can handle File objects directly
            const result = await FileUploader.uploadMedia(acceptedFiles[0]);
            if (result.url) {
              setPublishPostStore({ link: result.url || undefined });
            }
          }
        } catch (error) {
          console.error('Upload failed:', error);
          if (error instanceof Error && !error.message.includes('File selection cancelled')) {
            alert(`${t('upload_failed')}: ${error.message}`);
          }
        } finally {
          setIsUploading(false);
        }
      }
    },
    [setPublishPostStore, t],
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    noClick: true,
    accept: {
      'image/*': [],
      'video/*': [],
      'audio/*': [],
      'application/pdf': [],
    },
  });

  const handleUpload = async () => {
    if (!(isAndroid || isElectron)) {
      if (window.confirm(t('upload_button_warning'))) {
        const link = document.createElement('a');
        link.href = 'https://github.com/plebbit/seedit/releases/latest';
        link.target = '_blank';
        link.rel = 'noopener noreferrer';
        link.click();
      }
      return;
    }

    try {
      setIsChoosingFile(true);

      const pickedFile = await FileUploader.pickMedia(); // base64 data
      setIsChoosingFile(false);

      setIsUploading(true);

      const uploadResult = await FileUploader.uploadMedia({
        fileData: pickedFile.data,
        fileName: pickedFile.fileName,
      });

      if (uploadResult?.url) {
        setPublishPostStore({ link: uploadResult.url });
      } else {
        throw new Error('No URL returned from upload');
      }
    } catch (error) {
      console.error('Process failed:', error);
      if (error instanceof Error && !error.message.includes('File selection cancelled')) {
        alert(`${t('upload_failed')}: ${error.message}`);
      } else if (typeof error === 'string' && !error.includes('File selection cancelled')) {
        alert(`${t('upload_failed')}: ${error}`);
      }
    } finally {
      setIsChoosingFile(false);
      setIsUploading(false);
    }
  };

  return (
        {isUploading ? (
            <LoadingEllipsis string={t('uploading')} />

    </div>
        ) : (
            <input {...getInputProps()} />
            <label onClick={() => (isUploading || isChoosingFile ? null : handleUpload())}>
              {t('choose_file')}
            </label>

    </div>
        )}

    </div>

    </div>
  );
};

const TitleField = () => {
  const { t } = useTranslation();
  const { title, setPublishPostStore } = usePublishPostStore();

  return (
        <textarea
          value={title}
          onChange={(e) => {
            setPublishPostStore({ title: e.target.value });
          }}
        />

    </div>

    </div>
  );
};

const ContentField = () => {
  const { t } = useTranslation();
  const [showPreview, setShowPreview] = useState(false);
  const [showFormattingHelp, setShowFormattingHelp] = useState(false);

  const { content, setPublishPostStore } = usePublishPostStore();

  return (
        {!showPreview ? (
          <textarea
            value={content || ''}
            onChange={(e) => {
              setPublishPostStore({ content: e.target.value });
            }}
          />
        ) : (
              <Markdown content={content || ''} />

    </div>

    </div>
        )}
          {showFormattingHelp && (
              {showPreview ? t('edit') : t('preview')}
            </button>
          )}
          <span
            onClick={() => {
              if (showFormattingHelp && showPreview) {
                setShowPreview(false);
              }
              setShowFormattingHelp(!showFormattingHelp);
            }}
          >
            {showFormattingHelp ? t('hide_help') : t('formatting_help')}

    </span>

    </div>
        {showFormattingHelp && <FormattingHelpTable />}

    </div>

    </div>
  );
};

const SubplebbitAddressField = () => {
  const { t } = useTranslation();
  const { subscriptions } = useAccount() || {};
  const defaultSubplebbitAddresses = useDefaultSubplebbitAddresses();
  const { subplebbitAddress: inputAddress, setPublishPostStore } = usePublishPostStore();

  const filteredSubplebbitAddresses = defaultSubplebbitAddresses.filter((address) => address?.toLowerCase()?.includes(inputAddress?.toLowerCase() || '')).slice(0, 10);
  const [isInputAddressFocused, setIsInputAddressFocused] = useState(false);
  const [activeDropdownIndex, setActiveDropdownIndex] = useState<number>(-1);

  // show list of random subplebbits only once when the component mounts
  const [randomSubplebbitSuggestions, setRandomSubplebbitSuggestions] = useState<string[]>([]);
  useEffect(() => {
    const generatedSubplebbits = getRandomSubplebbits(defaultSubplebbitAddresses, 10);
    setRandomSubplebbitSuggestions(generatedSubplebbits);
  }, [defaultSubplebbitAddresses]);
  const listSource = subscriptions?.length > 5 ? subscriptions : randomSubplebbitSuggestions;

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === 'ArrowDown') {
        setActiveDropdownIndex((prevIndex) => (prevIndex < filteredSubplebbitAddresses.length - 1 ? prevIndex + 1 : prevIndex));
      } else if (e.key === 'ArrowUp') {
        setActiveDropdownIndex((prevIndex) => (prevIndex > 0 ? prevIndex - 1 : 0));
      } else if (e.key === 'Enter') {
        if (activeDropdownIndex !== -1) {
          const selectedAddress = filteredSubplebbitAddresses[activeDropdownIndex];
          setPublishPostStore({ subplebbitAddress: selectedAddress });
        }
        setActiveDropdownIndex(-1);
        setIsInputAddressFocused(false);
      }
    },
    [filteredSubplebbitAddresses, activeDropdownIndex, setPublishPostStore],
  );

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [handleKeyDown]);

  const handleSubplebbitSelect = (subplebbitAddress: string) => {
    setPublishPostStore({ subplebbitAddress: subplebbitAddress });
    setIsInputAddressFocused(false);
    setActiveDropdownIndex(-1);
  };

  const getRandomSubplebbits = (addresses: string[], count: number) => {
    let shuffled = addresses.sort(() => 0.5 - Math.random());
    return shuffled.slice(0, count);
  };

  const defaultSubplebbitsDropdown = (
      {filteredSubplebbitAddresses.map((subplebbitAddress, index) => (
        <li
          key={subplebbitAddress}
          onClick={() => handleSubplebbitSelect(subplebbitAddress)}
          onMouseEnter={() => setActiveDropdownIndex(index)}
        >
          {subplebbitAddress}

    </li>
      ))}
    </ul>
  );

  return (
        <input
          type='text'
          value={inputAddress ?? ''}
          onChange={(e) => {
            setPublishPostStore({ subplebbitAddress: e.target.value });
          }}
          autoCorrect='off'
          autoComplete='off'
          spellCheck='false'
          onFocus={() => setIsInputAddressFocused(true)}
          onBlur={() => setTimeout(() => setIsInputAddressFocused(false), 100)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              e.preventDefault();
              (e.target as HTMLInputElement).blur();
            }
          }}
        />
        {inputAddress && isInputAddressFocused && filteredSubplebbitAddresses.length > 0 && defaultSubplebbitsDropdown}
          {listSource.map((subscription: string) => (
            <span
              key={subscription}
              onClick={() => {
                setPublishPostStore({ subplebbitAddress: subscription });
              }}
            >
              {Plebbit.getShortAddress(subscription)}

    </span>
          ))}

    </div>

    </div>

    </div>
  );
};

const RulesInfo = ({ shortAddress, rules }: { shortAddress: string; rules: string[] }) => {
  const { t } = useTranslation();

  return (
        {t('rules_for')} p/{shortAddress}

    </span>

    </div>

    </div>

    </div>
  );
};

const SubmitOptions = () => {
  const { t } = useTranslation();
  const { setPublishPostStore } = usePublishPostStore();

  return (
            <label>
              <input type='checkbox' onChange={(e) => setPublishPostStore({ spoiler: e.target.checked })} />
              {t('spoiler')}
            </label>

    </div>
            <label>
              <input type='checkbox' onChange={(e) => setPublishPostStore({ nsfw: e.target.checked })} />
              {t('nsfw')}
            </label>

    </div>

    </div>

    </div>

    </div>
  );
};

const SubmitPage = () => {
  const { t } = useTranslation();
  const params = useParams();
  const navigate = useNavigate();

  const { link, title, subplebbitAddress, publishCommentOptions, setPublishPostStore, resetPublishPostStore } = usePublishPostStore();

  useEffect(() => {
    setPublishPostStore({ subplebbitAddress: params.subplebbitAddress || '' });
  }, [params.subplebbitAddress, setPublishPostStore]);

  const selectedSubplebbitData = useSubplebbit({ subplebbitAddress });
  const { rules, title: subplebbitTitle } = selectedSubplebbitData;
  const shortAddress = subplebbitAddress && Plebbit.getShortAddress(subplebbitAddress);
  const { isOffline, offlineTitle } = useIsSubplebbitOffline(selectedSubplebbitData);

  const { index, publishComment } = usePublishComment(publishCommentOptions);

  const onPublish = () => {
    if (!title) {
      alert(`Missing title`);
      return;
    }
    if (link && !isValidURL(link)) {
      alert(`Invalid URL`);
      return;
    }
    if (!subplebbitAddress) {
      alert(`Missing community address`);
      return;
    }

    publishComment();
  };

  // redirect to pending page when pending comment is created
  useEffect(() => {
    if (typeof index === 'number') {
      resetPublishPostStore();
      navigate(`/profile/${index}`);
    }
  }, [index, resetPublishPostStore, navigate]);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const documentTitle = t('submit_to_string', {
    string: subplebbitTitle || shortAddress || 'Seedit',
    interpolation: { escapeValue: false },
  });

  useEffect(() => {
    document.title = documentTitle;
  }, [documentTitle]);

  return (
      <h1>
        <Trans
          i18nKey='submit_to'
          shouldUnescape={true}
          values={{
            link: subplebbitTitle || shortAddress || 'seedit',
          }}
          components={{
          }}
        />
      </h1>
          <UrlField />
          {!link && <UploadMediaForm />}
          <TitleField />
          <ContentField />
          <SubplebbitAddressField />
          {rules?.length > 0 && <RulesInfo shortAddress={shortAddress || ''} rules={rules} />}
          <SubmitOptions />
          <div>*{t('required')}</div>
              {t('submit')}
            </button>

    </div>

    </div>

    </div>

    </div>
  );
};

export default SubmitPage;
