import { useTranslation } from 'react-i18next';

interface LabelProps {
  color: string;
  text: string;
  isFirstInLine?: boolean;
  title?: string;
}

const Label = ({ color, text, isFirstInLine = false, title = '' }: LabelProps) => {
  const { t } = useTranslation();

  return (
    </span>
  );
};

export default Label;
