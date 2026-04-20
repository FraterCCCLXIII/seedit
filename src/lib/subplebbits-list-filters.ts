export const MY_COMMUNITIES_ROUTES = {
  all: '/communities',
  subscriber: '/communities/subscriber',
  moderator: '/communities/moderator',
  admin: '/communities/admin',
  owner: '/communities/owner',
} as const;

export type MyCommunitiesTab = keyof typeof MY_COMMUNITIES_ROUTES;

export const getMyCommunitiesTab = (pathname: string): MyCommunitiesTab => {
  if (pathname === '/communities/subscriber') return 'subscriber';
  if (pathname === '/communities/moderator') return 'moderator';
  if (pathname === '/communities/admin') return 'admin';
  if (pathname === '/communities/owner') return 'owner';
  return 'all';
};

export const VOTE_ROUTES = {
  all: '/communities/vote',
  passing: '/communities/vote/passing',
  rejecting: '/communities/vote/rejecting',
} as const;

export type VoteTab = keyof typeof VOTE_ROUTES;

export const getVoteTab = (pathname: string): VoteTab => {
  if (pathname === '/communities/vote/passing') return 'passing';
  if (pathname === '/communities/vote/rejecting') return 'rejecting';
  return 'all';
};
