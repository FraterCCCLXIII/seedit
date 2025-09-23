import { useTranslation } from 'react-i18next';
// Removed CSS modules import - converted to Tailwind classes

interface LabelProps {
  color: string;
  text: string;
  isFirstInLine?: boolean;
  title?: string;
}

const Label = ({ color, text, isFirstInLine = false, title = '' }: LabelProps) => {
  const { t } = useTranslation();

  const getColorClasses = (color: string) => {
    switch (color) {
      case 'yellow':
        return 'text-yellow-500 border-yellow-500';
      case 'red':
        return 'text-red-500 border-red-500';
      case 'green':
        return 'text-green-500 border-green-500';
      case 'nsfw-red':
        return 'text-red-600 border-red-600';
      default:
        return 'text-gray-800 dark:text-gray-200 border-current';
    }
  };

  return (
    <span title={title} className={`px-1.5 ${isFirstInLine ? '!pl-0' : ''}`}>
      <span className={`rounded border inline-block text-[10px] leading-[14px] px-1 uppercase ${getColorClasses(color)}`}>{t(text)}</span>
    </span>
  );
};

export default Label;
