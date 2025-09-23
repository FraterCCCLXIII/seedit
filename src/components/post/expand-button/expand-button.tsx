import { CommentMediaInfo } from '../../../lib/utils/media-utils';

interface ExpandButtonProps {
  commentMediaInfo?: CommentMediaInfo;
  content?: string;
  expanded: boolean;
  hasThumbnail: boolean;
  link?: string;
  toggleExpanded: () => void;
}

const ExpandButton = ({ commentMediaInfo, content, expanded, hasThumbnail, link, toggleExpanded }: ExpandButtonProps) => {
  let initialButtonType = hasThumbnail || commentMediaInfo?.type === 'audio' || commentMediaInfo?.type === 'iframe' ? 'expand-play-button' : 'expand-text-button';

  if (commentMediaInfo?.type === 'webpage' && content && content.trim().length > 0) {
    initialButtonType = 'expand-text-button';
  }

  if (commentMediaInfo?.type === 'pdf') {
    initialButtonType = 'expand-play-button';
  }

  const buttonType = expanded ? 'expand-close-button' : initialButtonType;

  return (
    ((content && !link) || link) && (
      <div className='py-0.5 pr-1.5 pl-0 float-left cursor-pointer' onClick={toggleExpanded}>
        <div className={`bg-cover h-[23px] w-[23px] block ${buttonType}`}></div>
      </div>
    )
  );
};

export default ExpandButton;
