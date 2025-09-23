
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
        {lastWord}
      </span>
    </span>
  );
};

export default LoadingEllipsis;
