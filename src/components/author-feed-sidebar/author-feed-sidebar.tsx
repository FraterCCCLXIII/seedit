import SearchBar from '../search-bar';
import { Footer } from '../sidebar';
import sidebarStyles from '../sidebar/sidebar.module.css';
import { cn } from '@/lib/utils';

/**
 * Right column for `/profile` and `/u/…` feeds: search + app footer links only (no profile card).
 */
const AuthorFeedSidebar = () => {
  return (
    <div className={cn(sidebarStyles.sidebar, sidebarStyles.sidebarChrome, 'text-foreground')}>
      <div className={sidebarStyles.searchBarWrapper}>
        <SearchBar />
      </div>
      <Footer />
    </div>
  );
};

export default AuthorFeedSidebar;
