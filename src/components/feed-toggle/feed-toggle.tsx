import React from 'react';
import { useTranslation } from 'react-i18next';
// Removed CSS modules import - converted to Tailwind classes

interface FeedToggleProps {
  mode: 'subscribed' | 'all';
  onModeChange: (mode: 'subscribed' | 'all') => void;
}

const FeedToggle = ({ mode, onModeChange }: FeedToggleProps) => {
  const { t } = useTranslation();

  return (
    <div className='flex justify-center mb-4 py-2'>
      <div className='flex bg-gray-100 dark:bg-gray-800 rounded-lg p-1 border border-gray-200 dark:border-gray-700'>
        <button
          className={`py-2 px-4 border-0 bg-transparent text-gray-600 dark:text-gray-400 text-sm font-medium rounded-md cursor-pointer transition-all duration-200 ease-in-out min-w-[80px] hover:text-gray-800 dark:hover:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-700 focus:outline-2 focus:outline-blue-500 focus:outline-offset-2 ${
            mode === 'subscribed' ? 'bg-white dark:bg-gray-900 text-gray-800 dark:text-gray-200 shadow-sm' : ''
          }`}
          onClick={() => onModeChange('subscribed')}
          type='button'
        >
          {t('subscribed')}
        </button>
        <button
          className={`py-2 px-4 border-0 bg-transparent text-gray-600 dark:text-gray-400 text-sm font-medium rounded-md cursor-pointer transition-all duration-200 ease-in-out min-w-[80px] hover:text-gray-800 dark:hover:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-700 focus:outline-2 focus:outline-blue-500 focus:outline-offset-2 ${
            mode === 'all' ? 'bg-white dark:bg-gray-900 text-gray-800 dark:text-gray-200 shadow-sm' : ''
          }`}
          onClick={() => onModeChange('all')}
          type='button'
        >
          {t('all')}
        </button>
      </div>
    </div>
  );
};

export default FeedToggle;
