interface LoadingEllipsisProps {
  string: string;
}

const LoadingEllipsis = ({ string }: LoadingEllipsisProps) => {
  const words = string.split(' ');
  const lastWord = words.pop();
  const restOfString = words.join(' ');

  return (
    <span>
      {restOfString}
      {restOfString && ' '}
      <span className='whitespace-nowrap'>
        {lastWord}
        <span className='inline-block w-[4ch] animate-ellipsis' />
      </span>
    </span>
  );
};

export default LoadingEllipsis;
