import { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

const DEFAULT_SORT = 'hot';

const useRedirectToDefaultSort = () => {
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const path = location.pathname;
    // Only normalize the home feed root. Do not prepend /hot to other paths (e.g. /submit).
    if (path === '/') {
      navigate(`/${DEFAULT_SORT}`, { replace: true });
    }
  }, [location.pathname, navigate]);
};

export default useRedirectToDefaultSort;
