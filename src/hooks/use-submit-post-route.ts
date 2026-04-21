import { useMemo } from 'react';
import { useLocation, useParams } from 'react-router-dom';
import { useAccountComment } from '@bitsocialnet/bitsocial-react-hooks';
import { isAllView, isDomainView, isHomeAboutView, isHomeView, isModView, isPendingPostView } from '../lib/utils/view-utils';

/**
 * Resolves `/submit` vs `/s/:address/submit` for the submit-post flow (modal + background location).
 */
export function useSubmitPostRoute(subplebbitAddressFromPage?: string) {
  const location = useLocation();
  const params = useParams();
  const rawAccountCommentIndex = params?.accountCommentIndex;
  const commentIndexFromRoute = rawAccountCommentIndex !== undefined && rawAccountCommentIndex !== '' ? Number(rawAccountCommentIndex) : undefined;
  const pendingPost = useAccountComment(
    typeof commentIndexFromRoute === 'number' && !Number.isNaN(commentIndexFromRoute) ? { commentIndex: commentIndexFromRoute } : undefined,
  );

  const isInHomeView = isHomeView(location.pathname);
  const isInHomeAboutView = isHomeAboutView(location.pathname);
  const isInAllView = isAllView(location.pathname);
  const isInModView = isModView(location.pathname);
  const isInDomainView = isDomainView(location.pathname);
  const isInPendingPostView = isPendingPostView(location.pathname, params);

  const resolvedAddress = subplebbitAddressFromPage ?? params?.subplebbitAddress;

  const submitRoute = useMemo(() => {
    if (isInHomeView || isInHomeAboutView || isInAllView || isInModView || isInDomainView) {
      return '/submit';
    }
    if (isInPendingPostView) {
      return `/s/${pendingPost?.subplebbitAddress}/submit`;
    }
    if (resolvedAddress) {
      return `/s/${resolvedAddress}/submit`;
    }
    return '/submit';
  }, [isInHomeView, isInHomeAboutView, isInAllView, isInModView, isInDomainView, isInPendingPostView, pendingPost?.subplebbitAddress, resolvedAddress]);

  return { submitRoute };
}
