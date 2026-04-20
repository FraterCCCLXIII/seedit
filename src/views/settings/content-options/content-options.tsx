import { useTranslation } from 'react-i18next';
import { Checkbox } from '@/components/ui/checkbox';
import { Radio } from '@/components/ui/radio';
import { useAccount } from '@bitsocialnet/bitsocial-react-hooks';
import { cn } from '@/lib/utils';
import { SettingsPage, SettingsSection } from '../settings-section';
import styles from './content-options.module.css';
import useContentOptionsStore from '../../../stores/use-content-options-store';
import { useDefaultSubplebbits } from '../../../hooks/use-default-subplebbits';
import { handleNSFWSubscriptionPrompt } from '../../../lib/utils/nsfw-subscription-utils';

const MediaOptions = () => {
  const { t } = useTranslation();
  const {
    blurNsfwThumbnails,
    setBlurNsfwThumbnails,
    mediaPreviewOption,
    setMediaPreviewOption,
    autoplayVideosOnComments,
    setAutoplayVideosOnComments,
    muteVideosOnComments,
    setMuteVideosOnComments,
    hideAvatars,
    setHideAvatars,
  } = useContentOptionsStore();

  const row = 'flex cursor-pointer items-start gap-2 leading-snug';
  const rowDisabled = 'flex cursor-not-allowed items-start gap-2 leading-snug';

  return (
    <div className={cn(styles.contentOptions, 'space-y-6 text-sm')}>
      <div className='space-y-3'>
        <p className='text-sm font-medium capitalize text-muted-foreground'>{t('media_previews')}</p>
        <div>
          <label className={row}>
            <Radio
              name='mediaPreviewOption'
              value='autoExpandAll'
              checked={mediaPreviewOption === 'autoExpandAll'}
              onChange={() => setMediaPreviewOption('autoExpandAll')}
            />
            {t('auto_expand_media_previews')}
          </label>
        </div>
        <div>
          <label className={row}>
            <Radio
              name='mediaPreviewOption'
              value='autoExpandExceptComments'
              checked={mediaPreviewOption === 'autoExpandExceptComments'}
              onChange={() => setMediaPreviewOption('autoExpandExceptComments')}
            />
            {t('dont_auto_expand_media_previews_on_comments_pages')}
          </label>
        </div>
        <div>
          <label
            className={rowDisabled}
            onClick={(e) => {
              e.preventDefault();
              window.alert(t('feature_not_available_yet'));
            }}
          >
            <Radio name='mediaPreviewOption' value='community' checked={mediaPreviewOption === 'community'} onChange={() => setMediaPreviewOption('community')} disabled />
            {t('expand_media_previews_based_on_community_media_preferences')}
          </label>
        </div>
      </div>
      <div className='space-y-3'>
        <p className='text-sm font-medium capitalize text-muted-foreground'>{t('video_player')}</p>
        <div>
          <label className={row}>
            <Checkbox checked={autoplayVideosOnComments} onChange={(e) => setAutoplayVideosOnComments(e.target.checked)} />
            {t('autoplay_videos_on_comments_page')}
          </label>
        </div>
        <div>
          <label className={row}>
            <Checkbox checked={muteVideosOnComments} onChange={(e) => setMuteVideosOnComments(e.target.checked)} />
            {t('mute_videos_by_default')}
          </label>
        </div>
      </div>
      <div className='space-y-3'>
        <p className='text-sm font-medium capitalize text-muted-foreground'>{t('nsfw_content')}</p>
        <div>
          <label className={row}>
            <Checkbox checked={blurNsfwThumbnails} onChange={(e) => setBlurNsfwThumbnails(e.target.checked)} />
            {t('blur_media')}
          </label>
        </div>
      </div>
      <div className='space-y-3'>
        <p className='text-sm font-medium capitalize text-muted-foreground'>{t('avatars')}</p>
        <div>
          <label className={row}>
            <Checkbox checked={hideAvatars} onChange={(e) => setHideAvatars(e.target.checked)} />
            {t('hide_avatars_from_replies')}
          </label>
        </div>
      </div>
    </div>
  );
};

const CommunitiesOptions = () => {
  const { t } = useTranslation();
  const account = useAccount();
  const defaultSubplebbits = useDefaultSubplebbits();
  const {
    hideAdultCommunities,
    hideGoreCommunities,
    hideAntiCommunities,
    hideVulgarCommunities,
    setHideAdultCommunities,
    setHideGoreCommunities,
    setHideAntiCommunities,
    setHideVulgarCommunities,
    hideDefaultCommunities,
    setHideDefaultCommunities,
  } = useContentOptionsStore();

  const row = 'flex cursor-pointer items-start gap-2 leading-snug';

  return (
    <div className={cn(styles.contentOptions, 'space-y-6 text-sm')}>
      <div className='space-y-3'>
        <p className='text-sm font-medium capitalize text-muted-foreground'>{t('default_communities')}</p>
        <div className='flex items-start gap-2'>
          <Checkbox
            id='hideAdultCommunities'
            ref={(el) => {
              if (el) {
                const allHidden = hideAdultCommunities && hideGoreCommunities && hideAntiCommunities && hideVulgarCommunities;
                const someHidden = hideAdultCommunities || hideGoreCommunities || hideAntiCommunities || hideVulgarCommunities;

                el.checked = allHidden;
                el.indeterminate = someHidden && !allHidden;
              }
            }}
            onChange={async (e) => {
              const newValue = e.target.checked;

              if (!newValue) {
                await handleNSFWSubscriptionPrompt({
                  account,
                  defaultSubplebbits,
                  tagsToShow: ['adult', 'gore', 'anti', 'vulgar'],
                  isShowingAll: true,
                });
              }

              setHideAdultCommunities(newValue);
              setHideGoreCommunities(newValue);
              setHideAntiCommunities(newValue);
              setHideVulgarCommunities(newValue);
            }}
          />
          <label htmlFor='hideAdultCommunities' className='pt-0.5 leading-snug'>
            {t('hide_communities_tagged_as_nsfw')}
          </label>
        </div>
        <div className={styles.nsfwTag}>
          <label className={row}>
            <Checkbox
              checked={hideAdultCommunities}
              onChange={async (e) => {
                const newValue = e.target.checked;

                if (!newValue) {
                  await handleNSFWSubscriptionPrompt({
                    account,
                    defaultSubplebbits,
                    tagsToShow: ['adult'],
                  });
                }

                setHideAdultCommunities(newValue);
              }}
            />
            {t('tagged_as_adult')}
          </label>
        </div>
        <div className={styles.nsfwTag}>
          <label className={row}>
            <Checkbox
              checked={hideGoreCommunities}
              onChange={async (e) => {
                const newValue = e.target.checked;

                if (!newValue) {
                  await handleNSFWSubscriptionPrompt({
                    account,
                    defaultSubplebbits,
                    tagsToShow: ['gore'],
                  });
                }

                setHideGoreCommunities(newValue);
              }}
            />
            {t('tagged_as_gore')}
          </label>
        </div>
        <div className={styles.nsfwTag}>
          <label className={row}>
            <Checkbox
              checked={hideAntiCommunities}
              onChange={async (e) => {
                const newValue = e.target.checked;

                if (!newValue) {
                  await handleNSFWSubscriptionPrompt({
                    account,
                    defaultSubplebbits,
                    tagsToShow: ['anti'],
                  });
                }

                setHideAntiCommunities(newValue);
              }}
            />
            {t('tagged_as_anti')}
          </label>
        </div>
        <div className={styles.nsfwTag}>
          <label className={row}>
            <Checkbox
              checked={hideVulgarCommunities}
              onChange={async (e) => {
                const newValue = e.target.checked;

                if (!newValue) {
                  await handleNSFWSubscriptionPrompt({
                    account,
                    defaultSubplebbits,
                    tagsToShow: ['vulgar'],
                  });
                }

                setHideVulgarCommunities(newValue);
              }}
            />
            {t('tagged_as_vulgar')}
          </label>
        </div>
      </div>
      <div className='space-y-3'>
        <p className='text-sm font-medium capitalize text-muted-foreground'>{t('topbar')}</p>
        <label className={row}>
          <Checkbox checked={hideDefaultCommunities} onChange={(e) => setHideDefaultCommunities(e.target.checked)} />
          {t('hide_default_communities_from_topbar')}
        </label>
      </div>
    </div>
  );
};

const ContentOptions = () => {
  const { t } = useTranslation();

  return (
    <SettingsPage>
      <SettingsSection title={t('media')}>
        <MediaOptions />
      </SettingsSection>
      <SettingsSection title={t('communities')}>
        <CommunitiesOptions />
      </SettingsSection>
    </SettingsPage>
  );
};

export default ContentOptions;
