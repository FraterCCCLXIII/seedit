import { useEffect, useMemo, useRef, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { StateSnapshot, Virtuoso, VirtuosoHandle } from 'react-virtuoso';
import { useAccount, useNotifications } from '@plebbit/plebbit-react-hooks';
import Reply from '../../components/reply/reply';
import { isInboxCommentRepliesView, isInboxPostRepliesView, isInboxUnreadView } from '../../lib/utils/view-utils';
import { useTranslation } from 'react-i18next';
import _ from 'lodash';
import ErrorDisplay from '../../components/error-display';

const lastVirtuosoStates: { [key: string]: StateSnapshot } = {};

const InboxTabs = () => {
  const { t } = useTranslation();
  const location = useLocation();
  const isInInboxCommentRepliesView = isInboxCommentRepliesView(location.pathname);
  const isInInboxPostRepliesView = isInboxPostRepliesView(location.pathname);
  const isInInboxUnreadView = isInboxUnreadView(location.pathname);
  const isInAllView = !isInInboxCommentRepliesView && !isInInboxPostRepliesView && !isInInboxUnreadView;

  return (
    <div>
      <Link to='/inbox'>
        {t('all')}
      </Link>
      <Link to='/inbox/unread'>
        {t('unread')}
      </Link>
      <Link to='/inbox/comment-replies'>
        {t('comment_replies')}
      </Link>
      <Link to='/inbox/post-replies'>
        {t('post_replies')}
      </Link>
    </div>
  );
};

const Inbox = () => {
  const { t } = useTranslation();
  const account = useAccount();
  const { unreadNotificationCount } = account || {};
  const { error, notifications, markAsRead } = useNotifications();
  const [shouldShowErrorToUser, setShouldShowErrorToUser] = useState(false);

  const location = useLocation();
  const isInInboxCommentRepliesView = isInboxCommentRepliesView(location.pathname);
  const isInInboxPostRepliesView = isInboxPostRepliesView(location.pathname);
  const isInInboxUnreadView = isInboxUnreadView(location.pathname);

  const filteredRepliesToUserReplies = useMemo(() => notifications?.filter((comment) => comment.parentCid !== comment.postCid) || [], [notifications]);
  const filteredRepliesToUserPosts = useMemo(() => notifications?.filter((comment) => comment.parentCid === comment.postCid) || [], [notifications]);
  const filteredUnreadNotifications = useMemo(() => notifications?.filter((comment) => !comment.markedAsRead) || [], [notifications]);

  let comments;
  if (isInInboxCommentRepliesView) {
    comments = filteredRepliesToUserReplies;
  } else if (isInInboxPostRepliesView) {
    comments = filteredRepliesToUserPosts;
  } else if (isInInboxUnreadView) {
    comments = filteredUnreadNotifications;
  } else {
    comments = notifications;
  }

  // save last virtuoso state on each scroll
  const virtuosoRef = useRef<VirtuosoHandle | null>(null);
  const lastVirtuosoState = lastVirtuosoStates?.[unreadNotificationCount];
  useEffect(() => {
    const setLastVirtuosoState = () =>
      virtuosoRef.current?.getState((snapshot) => {
        // TODO: not sure if checking for empty snapshot.ranges works for all scenarios
        if (snapshot?.ranges?.length) {
          lastVirtuosoStates[unreadNotificationCount] = snapshot;
        }
      });
    window.addEventListener('scroll', setLastVirtuosoState);
    // clean listener on unmount
    return () => window.removeEventListener('scroll', setLastVirtuosoState);
  }, [unreadNotificationCount]);

  const documentTitle = useMemo(() => {
    let title = _.startCase(t('inbox'));
    if (isInInboxUnreadView) {
      title += ` - ${_.startCase(t('unread'))}`;
    } else if (isInInboxCommentRepliesView) {
      title += ` - ${_.startCase(t('comment_replies'))}`;
    } else if (isInInboxPostRepliesView) {
      title += ` - ${_.startCase(t('post_replies'))}`;
    }
    return `${title} - Seedit`;
  }, [isInInboxCommentRepliesView, isInInboxPostRepliesView, isInInboxUnreadView, t]);

  useEffect(() => {
    document.title = documentTitle;
  }, [documentTitle]);

  useEffect(() => {
    if (error?.message && comments.length === 0) {
      setShouldShowErrorToUser(true);
    } else if (comments.length > 0) {
      setShouldShowErrorToUser(false);
    }
  }, [error, comments]);

  return (
    <div>
      <InboxTabs />
      {account && notifications.length ? (
        <button>
          {t('mark_all_read')}
        </button>
      ) : (
        null
      )}

      {shouldShowErrorToUser && (
        <div>
          <ErrorDisplay error={error} />
        </div>
      )}
      
      <Virtuoso
        increaseViewportBy={{ bottom: 1200, top: 600 }}
        totalCount={notifications?.length || 0}
        data={comments}
        itemContent={(index, notification) => (
            <Reply index={index} isSingleReply={true} reply={notification} isNotification={true} />

    </div>
        )}
        useWindowScroll={true}
        ref={virtuosoRef}
        restoreStateFrom={lastVirtuosoState}
        initialScrollTop={lastVirtuosoState?.scrollTop}
      />

    </div>
  );
};

export default Inbox;
