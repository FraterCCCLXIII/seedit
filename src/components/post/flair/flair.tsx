// Removed CSS modules import - converted to Tailwind classes

interface FlairProps {
  flair: {
    text: string;
    backgroundColor?: string;
    textColor?: string;
    expiresAt?: number;
  };
}

const Flair = ({ flair }: FlairProps) => {
  const isExpired = flair.expiresAt ? Date.now() / 1000 > flair.expiresAt : false;

  if (isExpired) {
    return null;
  }

  const flairStyle = {
    backgroundColor: flair.backgroundColor || 'defaultColor',
    color: flair.textColor || 'defaultTextColor',
  };

  return (
    <span className='px-1'>
      <span
        className='text-xs font-medium leading-4 rounded-sm inline-block h-4 overflow-hidden px-1 text-ellipsis align-middle whitespace-nowrap max-w-none'
        style={flairStyle}
      >
        {flair.text}
      </span>
    </span>
  );
};

export default Flair;
