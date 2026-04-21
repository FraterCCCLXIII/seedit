import { useCallback, useEffect, useId, useMemo, useRef, useState } from 'react';
import { Trans, useTranslation } from 'react-i18next';
import { HashLink } from 'react-router-hash-link';
import { Outlet, useParams } from 'react-router-dom';
import { StateSnapshot, Virtuoso, VirtuosoHandle } from 'react-virtuoso';
import { autoUpdate, flip, FloatingFocusManager, FloatingPortal, offset, shift, useClick, useDismiss, useFloating, useInteractions, useRole } from '@floating-ui/react';
import { useAccount, useAccountComments, useAccountVotes, useComment, type AccountPublicationsFilter } from '@bitsocialnet/bitsocial-react-hooks';
import AuthorFeedSidebar from '../../components/author-feed-sidebar';
import Post from '../../components/post';
import Reply from '../../components/reply';
import { StandardPageContent } from '@/components/layout';
import { PixelIcon } from '@/components/ui/pixel-icon';
import { cn } from '@/lib/utils';
import { feedShellMainProps, feedShellSidebarProps } from '../../lib/feed-shell-data';
import styles from './profile.module.css';
import ErrorDisplay from '../../components/error-display';
import { getAccountHistoryOrder, getAccountHistoryPage } from '../../lib/utils/account-history-utils';

const pageSize = 10;
const sortTypes: string[] = ['new', 'old'];
const lastVirtuosoStates: { [key: string]: StateSnapshot } = {};

type SortDropdownProps = {
  onSortChange: (sortType: string) => void;
};

const SortDropdown = ({ onSortChange }: SortDropdownProps) => {
  const { t } = useTranslation();
  const [selectedSort, setSelectedSort] = useState<string>(sortTypes[0]);
  const [open, setOpen] = useState(false);
  const baseId = useId();
  const labelId = `${baseId}-sort-label`;
  const menuId = `${baseId}-sort-menu`;

  const { refs, floatingStyles, context } = useFloating({
    open,
    onOpenChange: setOpen,
    placement: 'bottom-start',
    middleware: [offset(6), flip({ fallbackAxisSideDirection: 'start' }), shift({ padding: 8 })],
    whileElementsMounted: autoUpdate,
  });

  const click = useClick(context);
  const dismiss = useDismiss(context);
  const role = useRole(context, { role: 'menu' });
  const { getReferenceProps, getFloatingProps } = useInteractions([click, dismiss, role]);

  const pickSort = (sortType: string) => {
    setSelectedSort(sortType);
    setOpen(false);
    onSortChange(sortType);
  };

  return (
    <div className={styles.sortToolbar}>
      <div className={styles.sortRow}>
        <span className={styles.sortLabel} id={labelId}>
          {t('reply_sorted_by')}
          <span className={styles.sortLabelColon} aria-hidden>
            :
          </span>
        </span>
        <button
          type='button'
          ref={refs.setReference}
          className={styles.sortTrigger}
          aria-haspopup='menu'
          aria-expanded={open}
          aria-controls={open ? menuId : undefined}
          aria-labelledby={labelId}
          {...getReferenceProps()}
        >
          <span className={styles.sortTriggerValue}>{t(selectedSort)}</span>
          <span className={cn(styles.sortChevron, open && styles.sortChevronOpen)} aria-hidden />
        </button>
        {open && (
          <FloatingPortal>
            <FloatingFocusManager context={context} modal={false}>
              <div id={menuId} ref={refs.setFloating} className={styles.sortMenu} style={floatingStyles} role='menu' aria-labelledby={labelId} {...getFloatingProps()}>
                {sortTypes.map((sortType) => (
                  <div
                    key={sortType}
                    role='menuitem'
                    className={cn(styles.sortMenuItem, selectedSort === sortType && styles.sortMenuItemSelected)}
                    onClick={() => pickSort(sortType)}
                  >
                    {t(sortType)}
                  </div>
                ))}
              </div>
            </FloatingFocusManager>
          </FloatingPortal>
        )}
      </div>
    </div>
  );
};

const PaginationControls = ({ currentPage, hasMore, onPageChange }: { currentPage: number; hasMore: boolean; onPageChange: (page: number) => void }) => {
  const { t } = useTranslation();
  return (
    (hasMore || currentPage > 1) && (
      <div className={styles.pagination}>
        {t('view_more')}:{' '}
        {currentPage > 1 && (
          <span className={styles.button} onClick={() => onPageChange(currentPage - 1)}>
            ‹ {t('previous')}
          </span>
        )}
        {hasMore && (
          <>
            {currentPage > 1 && <span className={styles.separator} />}
            <span className={styles.button} onClick={() => onPageChange(currentPage + 1)}>
              {t('next')} ›
            </span>
          </>
        )}
      </div>
    )
  );
};

const CommentItem = ({ cid }: { cid: string }) => {
  const comment = useComment({ commentCid: cid });

  if (!comment || !comment.subplebbitAddress) return null;

  return comment.parentCid ? <Reply key={comment.cid} reply={comment} isSingleReply={true} /> : <Post key={comment.cid} post={comment} />;
};

const VirtualizedCommentList = ({ comments }: { comments: any[] }) => {
  const account = useAccount();
  const params = useParams();
  // save last virtuoso state on each scroll
  const virtuosoRef = useRef<VirtuosoHandle | null>(null);
  const lastVirtuosoState = lastVirtuosoStates?.[account?.shortAddress + params.sortType];
  useEffect(() => {
    const setLastVirtuosoState = () =>
      virtuosoRef.current?.getState((snapshot: StateSnapshot) => {
        if (snapshot?.ranges?.length) {
          lastVirtuosoStates[account?.shortAddress + params.sortType] = snapshot;
        }
      });
    window.addEventListener('scroll', setLastVirtuosoState);
    return () => window.removeEventListener('scroll', setLastVirtuosoState);
  }, [account?.shortAddress, params.sortType]);

  return (
    <Virtuoso
      increaseViewportBy={{ bottom: 1200, top: 600 }}
      data={comments}
      totalCount={comments.length}
      itemContent={(index, post: any) =>
        post?.parentCid ? <Reply key={post?.cid} index={index} isSingleReply={true} reply={post} /> : <Post key={post?.cid} index={index} post={post} />
      }
      useWindowScroll={true}
      ref={virtuosoRef}
      restoreStateFrom={lastVirtuosoState}
      initialScrollTop={lastVirtuosoState?.scrollTop}
    />
  );
};

const Overview = () => {
  const { t } = useTranslation();
  const [sortType, setSortType] = useState('new');
  const { error, accountComments } = useAccountComments({ order: getAccountHistoryOrder(sortType) });
  const [shouldShowErrorToUserOverview, setShouldShowErrorToUserOverview] = useState(false);

  useEffect(() => {
    if (error?.message && accountComments.length === 0) {
      setShouldShowErrorToUserOverview(true);
    } else if (accountComments.length > 0) {
      setShouldShowErrorToUserOverview(false);
    }
  }, [error, accountComments]);

  const prevErrorMessageRef = useRef<string | undefined>(undefined);
  useEffect(() => {
    if (error && error.message !== prevErrorMessageRef.current) {
      console.log(error);
      prevErrorMessageRef.current = error.message;
    }
  }, [error]);

  return (
    <div>
      {shouldShowErrorToUserOverview && (
        <div className={styles.error}>
          <ErrorDisplay error={error} />
        </div>
      )}
      <SortDropdown onSortChange={setSortType} />
      {accountComments.length === 0 ? <div className={styles.nothingFound}>{t('nothing_found')}</div> : <VirtualizedCommentList comments={accountComments} />}
    </div>
  );
};

const Comments = () => {
  const { t } = useTranslation();
  const [sortType, setSortType] = useState('new');
  const repliesFilter = useCallback<AccountPublicationsFilter>((publication) => ('parentCid' in publication ? Boolean(publication.parentCid) : false), []);
  const { error, accountComments } = useAccountComments({ filter: repliesFilter, order: getAccountHistoryOrder(sortType) });
  const [shouldShowErrorToUserComments, setShouldShowErrorToUserComments] = useState(false);

  useEffect(() => {
    if (error?.message && accountComments.length === 0) {
      setShouldShowErrorToUserComments(true);
    } else if (accountComments.length > 0) {
      setShouldShowErrorToUserComments(false);
    }
  }, [error, accountComments]);

  const prevErrorMessageRef = useRef<string | undefined>(undefined);
  useEffect(() => {
    if (error && error.message !== prevErrorMessageRef.current) {
      console.log(error);
      prevErrorMessageRef.current = error.message;
    }
  }, [error]);

  return (
    <div>
      {shouldShowErrorToUserComments && (
        <div className={styles.error}>
          <ErrorDisplay error={error} />
        </div>
      )}
      <SortDropdown onSortChange={setSortType} />
      {accountComments.length === 0 ? <div className={styles.nothingFound}>{t('nothing_found')}</div> : <VirtualizedCommentList comments={accountComments} />}
    </div>
  );
};

const Submitted = () => {
  const { t } = useTranslation();
  const [sortType, setSortType] = useState('new');
  const submittedFilter = useCallback<AccountPublicationsFilter>((publication) => ('parentCid' in publication ? !publication.parentCid : false), []);
  const { error, accountComments } = useAccountComments({ filter: submittedFilter, order: getAccountHistoryOrder(sortType) });
  const [shouldShowErrorToUserSubmitted, setShouldShowErrorToUserSubmitted] = useState(false);

  useEffect(() => {
    if (error?.message && accountComments.length === 0) {
      setShouldShowErrorToUserSubmitted(true);
    } else if (accountComments.length > 0) {
      setShouldShowErrorToUserSubmitted(false);
    }
  }, [error, accountComments]);

  const prevErrorMessageRef = useRef<string | undefined>(undefined);
  useEffect(() => {
    if (error && error.message !== prevErrorMessageRef.current) {
      console.log(error);
      prevErrorMessageRef.current = error.message;
    }
  }, [error]);

  return (
    <div>
      {shouldShowErrorToUserSubmitted && (
        <div className={styles.error}>
          <ErrorDisplay error={error} />
        </div>
      )}
      <SortDropdown onSortChange={setSortType} />
      {accountComments.length === 0 ? <div className={styles.nothingFound}>{t('nothing_found')}</div> : <VirtualizedCommentList comments={accountComments} />}
    </div>
  );
};

const VotedComments = ({ voteType }: { voteType: 1 | -1 }) => {
  const { t } = useTranslation();
  const [currentPage, setCurrentPage] = useState(1);
  const [sortType, setSortType] = useState('new');
  const [shouldShowErrorToUserVoted, setShouldShowErrorToUserVoted] = useState(false);
  const order = getAccountHistoryOrder(sortType);
  const page = getAccountHistoryPage(currentPage);
  const { error, accountVotes } = useAccountVotes({ vote: voteType, order, page, pageSize });
  const { accountVotes: nextPageVotes } = useAccountVotes({ vote: voteType, order, page: page + 1, pageSize: 1 });
  const paginatedCids = useMemo(() => accountVotes.map((vote) => vote.commentCid).filter((cid): cid is string => Boolean(cid)), [accountVotes]);
  const hasMore = nextPageVotes.length > 0;

  useEffect(() => {
    if (error?.message && paginatedCids.length === 0 && hasMore) {
      setShouldShowErrorToUserVoted(true);
    } else if (paginatedCids.length > 0) {
      setShouldShowErrorToUserVoted(false);
    }
  }, [error, paginatedCids, hasMore]);

  const prevErrorMessageRef = useRef<string | undefined>(undefined);
  useEffect(() => {
    if (error && error.message !== prevErrorMessageRef.current) {
      console.log(error);
      prevErrorMessageRef.current = error.message;
    }
  }, [error]);

  return (
    <div>
      {shouldShowErrorToUserVoted && (
        <div className={styles.error}>
          <ErrorDisplay error={error} />
        </div>
      )}
      <SortDropdown onSortChange={setSortType} />
      {paginatedCids.length === 0 ? <div className={styles.nothingFound}>{t('nothing_found')}</div> : paginatedCids.map((cid) => <CommentItem key={cid} cid={cid} />)}
      <PaginationControls currentPage={currentPage} hasMore={hasMore} onPageChange={setCurrentPage} />
    </div>
  );
};

const HiddenComments = () => {
  const { t } = useTranslation();
  const account = useAccount();
  const [currentPage, setCurrentPage] = useState(1);

  const hiddenCommentCids = useMemo(() => {
    const allHiddenCids = Object.keys(account?.blockedCids ?? {});
    return allHiddenCids.slice(0, currentPage * pageSize);
  }, [account?.blockedCids, currentPage]);

  const hasMore = (account?.blockedCids && Object.keys(account.blockedCids).length > currentPage * pageSize) || false;

  return (
    <div>
      {hiddenCommentCids.length === 0 ? (
        <div className={styles.nothingFound}>{t('nothing_found')}</div>
      ) : (
        hiddenCommentCids.map((cid) => <CommentItem key={cid} cid={cid} />)
      )}
      <PaginationControls currentPage={currentPage} hasMore={hasMore} onPageChange={setCurrentPage} />
    </div>
  );
};

const Profile = () => {
  const { t } = useTranslation();
  const account = useAccount();
  // Show infobar for first 3 visits if account wasn't imported
  const [showInfobar, setShowInfobar] = useState(() => {
    const profileVisits = parseInt(localStorage.getItem('profileVisits') || '0');
    const importedAccountAddress = localStorage.getItem('importedAccountAddress');
    const shouldShow = profileVisits < 4 && importedAccountAddress !== account?.author?.address;

    if (shouldShow) {
      localStorage.setItem('profileVisits', (profileVisits + 1).toString());
    }

    return shouldShow;
  });

  const profileTitle = account?.author?.displayName ? `${account?.author?.displayName} (u/${account?.author?.shortAddress})` : `u/${account?.author?.shortAddress}`;
  useEffect(() => {
    document.title = profileTitle + ' - Seedit';
  }, [t, profileTitle]);

  const handleCloseInfobar = useCallback(() => {
    setShowInfobar(false);
    localStorage.setItem('profileVisits', '4');
  }, []);

  const infobar = showInfobar && (
    <div className={styles.infobar} role='status'>
      <div className={styles.infoContent}>
        <Trans
          i18nKey='profile_info'
          values={{ shortAddress: account?.author?.shortAddress }}
          components={{
            1: <HashLink key='displayNameLink' className={styles.infobarLink} to='/settings#displayName' />,
            2: <HashLink key='exportAccountLink' className={styles.infobarLink} to='/settings#exportAccount' />,
            3: <HashLink key='newUsersLink' className={styles.infobarLink} to='/about#newUsers' />,
          }}
        />
      </div>
      <button type='button' className={styles.infobarDismiss} onClick={handleCloseInfobar} aria-label={t('close')}>
        <PixelIcon glyph='times' className={styles.infobarDismissIcon} aria-hidden />
      </button>
    </div>
  );

  return (
    <div className={styles.content}>
      <div {...feedShellMainProps} className={styles.mainColumn}>
        {infobar}
        <StandardPageContent variant='feedColumn'>
          <Outlet />
        </StandardPageContent>
      </div>
      <div className={styles.sidebarColumn} {...feedShellSidebarProps}>
        <AuthorFeedSidebar />
      </div>
    </div>
  );
};

Profile.Overview = Overview;
Profile.Comments = Comments;
Profile.Submitted = Submitted;
Profile.VotedComments = VotedComments;
Profile.HiddenComments = HiddenComments;

export default Profile;
