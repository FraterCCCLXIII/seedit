import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface FeedFiltersState {
  hideBlockedUsers: boolean;
  hideDownvotedPosts: boolean;
  hideHiddenPosts: boolean;
  hideReadPosts: boolean;
  hideReportedPosts: boolean;
}

const defaultFeedFilters: FeedFiltersState = {
  hideBlockedUsers: false,
  hideDownvotedPosts: false,
  hideHiddenPosts: false,
  hideReadPosts: false,
  hideReportedPosts: false,
};

interface FeedFiltersStore {
  isSearching: boolean;
  setIsSearching: (isSearching: boolean) => void;
  feedFilters: FeedFiltersState;
  setFeedFilters: (partial: Partial<FeedFiltersState>) => void;
}

const useFeedFiltersStore = create<FeedFiltersStore>()(
  persist(
    (set) => ({
      isSearching: false,
      setIsSearching: (isSearching) => set({ isSearching }),
      feedFilters: { ...defaultFeedFilters },
      setFeedFilters: (partial) =>
        set((state) => ({
          feedFilters: { ...state.feedFilters, ...partial },
        })),
    }),
    {
      name: 'feed-filters-searching',
      merge: (persisted, current) => {
        const p = persisted as Partial<FeedFiltersStore> | undefined;
        return {
          ...current,
          ...p,
          feedFilters: {
            ...defaultFeedFilters,
            ...(p?.feedFilters ?? {}),
          },
        };
      },
    },
  ),
);

export default useFeedFiltersStore;
