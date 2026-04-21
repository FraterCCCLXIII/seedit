import { createContext, useContext } from 'react';

const FeedShellLayoutContext = createContext(false);

export const FeedShellLayoutProvider = FeedShellLayoutContext.Provider;

/** True when rendered under {@link FeedShellLayout} (left rail already carries the wordmark / home). */
export function useFeedShellLayout(): boolean {
  return useContext(FeedShellLayoutContext);
}
