import { sortTypes } from '../../constants/sort-types';
import type { ParamsType } from './view-utils';

const AGGREGATE_SUBS = new Set(['all', 'mod']);
const SUB_NON_SORT_SEGMENTS = new Set(['c', 'settings', 'submit', 'about']);
const sortTypeSet = new Set(sortTypes);

/**
 * `FeedShellLayout` renders `<Header />` as a sibling of `<Outlet />`, above the inner
 * `<Routes>` in `FeedShellWithModalRoutes`. React Router therefore does not expose
 * `:subplebbitAddress` / `:sortType` etc. to `useParams()` in `Header`. Merge the
 * active path into params so shell chrome matches the leaf route.
 */
export function mergeFeedShellRouteParams(base: Readonly<ParamsType>, pathname: string): ParamsType {
  const decoded = decodeURIComponent(pathname);
  const out: ParamsType = { ...base };

  if (!out.subplebbitAddress) {
    const sm = decoded.match(/^\/s\/([^/]+)/);
    if (sm) {
      const seg = sm[1];
      if (seg && !AGGREGATE_SUBS.has(seg)) {
        out.subplebbitAddress = seg;
      }
    }
  }

  if (!out.sortType) {
    for (const agg of ['all', 'mod'] as const) {
      const prefix = `/s/${agg}`;
      if (decoded === prefix || decoded === `${prefix}/`) {
        break;
      }
      if (decoded.startsWith(`${prefix}/`)) {
        const parts = decoded.slice(prefix.length + 1).split('/').filter(Boolean);
        if (parts[0] && sortTypeSet.has(parts[0])) {
          out.sortType = parts[0];
          if (parts[1]) {
            out.timeFilterName = parts[1];
          }
        }
        break;
      }
    }
  }

  if (!out.sortType && !decoded.startsWith('/s/')) {
    const parts = decoded.split('/').filter(Boolean);
    if (parts[0] && sortTypeSet.has(parts[0])) {
      out.sortType = parts[0];
      if (parts[1]) {
        out.timeFilterName = parts[1];
      }
    }
  }

  if (out.subplebbitAddress) {
    const addr = out.subplebbitAddress;
    const pfx = `/s/${addr}/`;
    if (decoded.startsWith(pfx)) {
      const rest = decoded.slice(pfx.length);
      const parts = rest.split('/').filter(Boolean);

      if (parts[0] === 'c' && parts[1] && !out.commentCid) {
        out.commentCid = parts[1];
      } else if (parts.length > 0 && !SUB_NON_SORT_SEGMENTS.has(parts[0]) && !out.sortType) {
        out.sortType = parts[0];
        if (parts[1] && !out.timeFilterName) {
          out.timeFilterName = parts[1];
        }
      }
    }
  }

  if (!out.domain) {
    const dm = decoded.match(/^\/domain\/([^/]+)/);
    if (dm) {
      out.domain = dm[1];
    }
  }

  if (out.domain) {
    const pfx = `/domain/${out.domain}/`;
    if (decoded.startsWith(pfx)) {
      const rest = decoded.slice(pfx.length);
      const parts = rest.split('/').filter(Boolean);
      if (parts[0] && !out.sortType) {
        out.sortType = parts[0];
        if (parts[1] && !out.timeFilterName) {
          out.timeFilterName = parts[1];
        }
      }
    }
  }

  if (!out.authorAddress) {
    const um = decoded.match(/^\/u\/([^/]+)\/c\/([^/]+)/);
    if (um) {
      out.authorAddress = um[1];
      out.commentCid = um[2];
    } else {
      const uOnly = decoded.match(/^\/u\/([^/]+)/);
      if (uOnly) {
        out.authorAddress = uOnly[1];
      }
    }
  }

  if (!out.accountCommentIndex) {
    const pm = decoded.match(/^\/profile\/(\d+)\/?$/);
    if (pm) {
      out.accountCommentIndex = pm[1];
    }
  }

  return out;
}
