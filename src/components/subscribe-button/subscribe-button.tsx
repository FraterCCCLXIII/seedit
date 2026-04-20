import { useLocation, useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useSubscribe } from '@bitsocialnet/bitsocial-react-hooks';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { isAuthorView, isProfileView, isPendingPostView } from '../../lib/utils/view-utils';
import styles from './subscribe-button.module.css';

/** Compactness: header uses `lg`, lists and sidebar use `default`, tight spots use `sm`. */
export type SubscribeButtonPillSize = 'sm' | 'default' | 'lg';

const SUBSCRIBE_BUTTON_SIZE = {
  sm: 'subscribeSm',
  default: 'subscribe',
  lg: 'subscribeLg',
} as const satisfies Record<SubscribeButtonPillSize, 'subscribeSm' | 'subscribe' | 'subscribeLg'>;

interface SubscribeButtonProps {
  address: string | undefined;
  onUnsubscribe?: (address: string) => void;
  /** Defaults to `lg` (community feed header). Use `default` for lists/sidebar. */
  pillSize?: SubscribeButtonPillSize;
  /** Called when the user joins (subscribe) from the not-subscribed state — e.g. all-feed post meta tracking. */
  onJoinClick?: () => void;
}

const SubscribeButton = ({ address, onUnsubscribe, pillSize = 'lg', onJoinClick }: SubscribeButtonProps) => {
  const { subscribe, subscribed, unsubscribe } = useSubscribe({ subplebbitAddress: address });
  const { t } = useTranslation();
  const location = useLocation();
  const params = useParams();
  const isInAuthorView = isAuthorView(location.pathname);
  const isInProfileView = isProfileView(location.pathname);
  const isInPendingPostView = isPendingPostView(location.pathname, params);
  const subplebbitPageString = subscribed ? `${t('leave')}` : `${t('join')}`;
  const authorPageString = '+ friends'; // TODO: add functionality once implemented in backend

  const handleSubscribe = () => {
    if (isInAuthorView) return; // TODO: remove once implemented in backend

    if (subscribed === false) {
      subscribe();
      onJoinClick?.();
    } else if (subscribed === true) {
      unsubscribe();
      if (onUnsubscribe && address) {
        onUnsubscribe(address);
      }
    }
  };

  if (isInProfileView && !isInPendingPostView) {
    return null;
  }

  return (
    <Button
      type='button'
      variant={subscribed === true ? 'following' : 'join'}
      size={SUBSCRIBE_BUTTON_SIZE[pillSize]}
      disabled={subscribed === undefined}
      className={cn(subscribed === true ? styles.stateFollowing : styles.stateJoin)}
      onClick={handleSubscribe}
    >
      {isInAuthorView ? authorPageString : subplebbitPageString}
    </Button>
  );
};

export default SubscribeButton;
