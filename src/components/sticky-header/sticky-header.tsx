import { useEffect, useRef, useState } from 'react';
// Removed CSS modules import - converted to Tailwind classes
import AccountBar from '../account-bar';
import { debounce } from 'lodash';

const StickyHeader = () => {
  // navbar animation on scroll - TopBar removed
  const [visible, setVisible] = useState(true);
  const prevScrollPosRef = useRef(0);

  useEffect(() => {
    const debouncedHandleScroll = debounce(() => {
      const currentScrollPos = window.scrollY;
      const prevScrollPos = prevScrollPosRef.current;

      setVisible(prevScrollPos > currentScrollPos || currentScrollPos < 10);
      prevScrollPosRef.current = currentScrollPos;
    }, 50);

    window.addEventListener('scroll', debouncedHandleScroll);

    return () => window.removeEventListener('scroll', debouncedHandleScroll);
  }, []);

  return (
    <div
      className='text-gray-800 dark:text-gray-200 bg-gray-100 dark:bg-gray-800 fixed w-full z-[6] will-change-transform transform translate-y-0 transition-transform duration-200 ease-in-out flex items-center justify-around'
      style={{ transform: visible ? 'translateY(0)' : 'translateY(-40px)' }}
    >
      <AccountBar />
    </div>
  );
};

export default StickyHeader;
