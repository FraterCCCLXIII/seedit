import { useState } from 'react';
import { Link, useLocation, useParams } from 'react-router-dom';
import {
  useAccount,
  useAccountComments,
  useAccountSubplebbits,
  AccountSubplebbit,
  useAuthor,
  useAuthorAvatar,
  useAuthorComments,
  useBlock,
  useComment,
  useSubplebbits,
} from '@plebbit/plebbit-react-hooks';
import Plebbit from '@plebbit/plebbit-js';
import { getFormattedTimeDuration } from '../../lib/utils/time-utils';
import { isAuthorView, isProfileView } from '../../lib/utils/view-utils';
import { findAuthorSubplebbits, estimateAuthorKarma } from '../../lib/utils/user-utils';
import { useTranslation } from 'react-i18next';
import { useDefaultSubplebbitAddresses } from '../../hooks/use-default-subplebbits';

interface AuthorModeratingListProps {
  accountSubplebbits: AccountSubplebbit[];
  authorSubplebbits: string[];
  isAuthor?: boolean;
}

const AuthorModeratingList = ({ accountSubplebbits, authorSubplebbits, isAuthor = false }: AuthorModeratingListProps) => {
  const { t } = useTranslation();
  const rawAddresses = isAuthor ? authorSubplebbits : Object.keys(accountSubplebbits);
  const subplebbitAddresses = [...new Set(rawAddresses)];

  return (
    subplebbitAddresses.length > 0 && (
          {subplebbitAddresses.map((address, index) => (
            <li key={index}>
              <Link to={`/p/${address}`}>p/{Plebbit.getShortAddress(address)}</Link>
            </li>
          ))}
        </ul>
      </div>
    )
  );
};

const AuthorSidebar = () => {
  const { t } = useTranslation();
  const location = useLocation();
  const params = useParams();
  const { authorAddress, commentCid } = useParams() || {};
  const { blocked, unblock, block } = useBlock({ address: authorAddress });
  const [showBlockConfirm, setShowBlockConfirm] = useState(false);

  const comment = useComment({ commentCid, onlyIfCached: true });
  const { imageUrl: authorPageAvatar } = useAuthorAvatar({ author: comment?.author });

  const isInAuthorView = isAuthorView(location.pathname);
  const isInProfileView = isProfileView(location.pathname);

  const userAccount = useAccount();
  const { imageUrl: profilePageAvatar } = useAuthorAvatar({ author: userAccount?.author });
  const { accountComments } = useAccountComments();
  const { accountSubplebbits } = useAccountSubplebbits();
  const profileOldestAccountTimestamp = accountComments?.length
    ? Math.min(...accountComments.filter((comment): comment is NonNullable<typeof comment> => comment != null).map((comment) => comment.timestamp))
    : Date.now();

  const defaultSubplebbitAddresses = useDefaultSubplebbitAddresses();
  const accountSubscriptions = userAccount?.subscriptions || [];
  const subscriptionsAndDefaults = [...accountSubscriptions, ...defaultSubplebbitAddresses];

  const subplebbits =
    useSubplebbits({
      subplebbitAddresses: subscriptionsAndDefaults || [],
      onlyIfCached: true,
    }).subplebbits?.filter(Boolean) || [];

  const authorAccount = useAuthor({ authorAddress, commentCid });
  const { authorComments } = useAuthorComments({ authorAddress, commentCid });
  const authorOldestCommentTimestamp = authorComments?.length
    ? Math.min(...authorComments.filter((comment): comment is NonNullable<typeof comment> => comment != null).map((comment) => comment.timestamp))
    : Date.now();
  const authorSubplebbits = findAuthorSubplebbits(authorAddress, Object.values(subplebbits));
  const estimatedAuthorKarma = estimateAuthorKarma(authorComments);

  const address = isInAuthorView ? params?.authorAddress : isInProfileView ? userAccount?.author?.address : '';
  const karma = isInAuthorView ? estimatedAuthorKarma : isInProfileView ? userAccount?.karma : '';
  const { postScore, replyScore } = karma || { postScore: 0, replyScore: 0 };

  const oldestCommentTimestamp = isInAuthorView ? authorOldestCommentTimestamp : isInProfileView ? profileOldestAccountTimestamp : Date.now();
  const displayName = isInAuthorView ? authorAccount?.author?.displayName : isInProfileView ? userAccount?.author?.displayName : '';

  const blockConfirm = () => {
    setShowBlockConfirm(true);
  };

  const handleBlock = () => {
    if (blocked) {
      unblock();
    } else {
      block();
    }
    setShowBlockConfirm(false);
  };

  const cancelBlock = () => {
    setShowBlockConfirm(false);
  };

  return (
      {((isInAuthorView && authorPageAvatar) || (isInProfileView && profilePageAvatar)) && (
          <img src={isInAuthorView ? authorPageAvatar : profilePageAvatar} alt='' />
        </div>
      )}
          {address}
          {isInProfileView && !displayName && (
              {' '}
              (
                <Link to='/settings#displayName'>{t('edit')}</Link>
              </span>
              )
            </span>
          )}
        </div>
        {/*  TODO: implement functionality for subscribing to users
        {isInAuthorView && authorAddress !== userAccount?.author?.address && (
            <SubscribeButton address={address} />
          </div>
        )} */}
        <div>
        </div>
        <div>
        </div>
          {isInAuthorView &&
            authorAddress !== userAccount?.author?.address &&
            (showBlockConfirm ? (
                {t('are_you_sure')}{' '}
                  {t('yes')}
                </span>
                {' / '}
                  {t('no')}
                </span>
              </span>
            ) : (
                {blocked ? t('unblock_user') : t('block_user')}
              </span>
            ))}
        </div>
      </div>
      {(Object.keys(accountSubplebbits).length > 0 || authorSubplebbits.length > 0) && (
        <AuthorModeratingList accountSubplebbits={accountSubplebbits} isAuthor={isInAuthorView} authorSubplebbits={authorSubplebbits} />
      )}
    </div>
  );
};

export default AuthorSidebar;
