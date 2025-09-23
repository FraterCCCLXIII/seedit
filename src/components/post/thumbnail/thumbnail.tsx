import { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { CommentMediaInfo } from '../../../lib/utils/media-utils';
import useFetchGifFirstFrame from '../../../hooks/use-fetch-gif-first-frame';
import useContentOptionsStore from '../../../stores/use-content-options-store';
import { useIsNsfwSubplebbit } from '../../../hooks/use-is-nsfw-subplebbit';

interface ThumbnailProps {
  cid?: string;
  commentMediaInfo?: CommentMediaInfo;
  expanded?: boolean;
  isLink: boolean;
  isNsfw?: boolean;
  isReply: boolean;
  isSpoiler?: boolean;
  isText: boolean;
  link: string;
  linkHeight?: number;
  linkWidth?: number;
  subplebbitAddress?: string;
  toggleExpanded?: () => void;
  isPdf?: boolean;
}

const Thumbnail = ({
  cid,
  commentMediaInfo,
  expanded = false,
  isLink = false,
  isNsfw = false,
  isReply = false,
  isSpoiler = false,
  isText = false,
  link,
  linkHeight,
  linkWidth,
  subplebbitAddress,
  toggleExpanded,
  isPdf = false,
}: ThumbnailProps) => {
  const [isNotFound, setIsNotFound] = useState(false);
  const iframeThumbnail = commentMediaInfo?.patternThumbnailUrl || commentMediaInfo?.thumbnail;
  let displayWidth, displayHeight, hasLinkDimensions;

  const { blurNsfwThumbnails } = useContentOptionsStore();
  const pageSubplebbitAddress = useParams().subplebbitAddress;
  const isNsfwSubplebbit = useIsNsfwSubplebbit(pageSubplebbitAddress || '');

  if (linkWidth && linkHeight) {
    let scale = Math.min(1, 70 / Math.max(linkWidth, linkHeight));
    displayWidth = `${linkWidth * scale}px`;
    displayHeight = `${linkHeight * scale}px`;
    hasLinkDimensions = true;
  } else {
    displayWidth = '70px';
    displayHeight = '70px';
    hasLinkDimensions = false;
  }

  if (isText || isLink || isPdf || isSpoiler || (isNsfw && !isNsfwSubplebbit) || isNotFound) {
    displayWidth = '50px';
    displayHeight = '50px';
    hasLinkDimensions = true;
  }

  const handleNotFound = () => {
    setIsNotFound(true);
  };

  let mediaComponent = null;
  let noMediaLinkIcon = '';
  const { frameUrl: gifFrameUrl, isLoading: gifFrameLoading } = useFetchGifFirstFrame(commentMediaInfo?.type === 'gif' ? commentMediaInfo.url : undefined);

  const isChromium = (() => {
    const ua = navigator.userAgent;
    return (ua.includes('Chrome') || ua.includes('Chromium') || ua.includes('Edge')) && !ua.includes('Firefox');
  })();

  const [videoDuration, setVideoDuration] = useState<string>('');

  if (commentMediaInfo?.type === 'image') {
    mediaComponent = <img src={commentMediaInfo.url} alt='' onError={handleNotFound} />;
  } else if (commentMediaInfo?.type === 'video') {
    mediaComponent = (
      <>
        {commentMediaInfo.thumbnail ? (
          <img src={commentMediaInfo.thumbnail} alt='' onError={handleNotFound} />
        ) : (
          <video
            src={`${commentMediaInfo.url}#t=0.001`}
            onLoadedMetadata={(e) => {
              const video = e.target as HTMLVideoElement;
              const minutes = Math.floor(video.duration / 60);
              const seconds = Math.floor(video.duration % 60);
              setVideoDuration(`${minutes}:${seconds.toString().padStart(2, '0')}`);
            }}
            onError={handleNotFound}
          />
        )}
      </>
    );
  } else if (commentMediaInfo?.type === 'webpage') {
    mediaComponent = <img src={commentMediaInfo.thumbnail} alt='' onError={handleNotFound} />;
  } else if (commentMediaInfo?.type === 'iframe') {
  } else if (commentMediaInfo?.type === 'gif') {
    if (gifFrameUrl) {
      mediaComponent = <img src={gifFrameUrl} alt='' onError={handleNotFound} />;
    } else if (gifFrameLoading) {
      displayWidth = '50px';
      displayHeight = '50px';
      hasLinkDimensions = false;
    } else {
      // Chrome has strong CORS restrictions that prevent frame extraction, so we show a placeholder
      if (isChromium) {
        displayWidth = '50px';
        displayHeight = '50px';
        hasLinkDimensions = true;
      } else {
        mediaComponent = <img src={commentMediaInfo.url} alt='' onError={handleNotFound} />;
      }
    }
  }

  if (isText) {
    noMediaLinkIcon = 'text';
  }

  if (isLink) {
    noMediaLinkIcon = 'link';
  }

  if (isPdf) {
    noMediaLinkIcon = 'pdf';
  }

  if (isSpoiler) {
    noMediaLinkIcon = 'spoiler';
  }

  if (isNsfw && blurNsfwThumbnails && !isNsfwSubplebbit) {
    noMediaLinkIcon = 'nsfw';
  }

  if (isNotFound) {
    noMediaLinkIcon = 'notfound';
  }

  const style = hasLinkDimensions ? ({ '--width': displayWidth, '--height': displayHeight } as React.CSSProperties) : {};

  return (
        {isReply || commentMediaInfo?.type === 'webpage' ? (
          <a
            href={link}
            target='_blank'
            rel='noopener noreferrer'
            onClick={(e) => {
              if (e.button === 0 && isReply) {
                e.preventDefault();
                toggleExpanded && !(isReply && (noMediaLinkIcon === 'link' || noMediaLinkIcon === 'notfound')) && toggleExpanded();
              }
            }}
          >
            {mediaComponent}
          </a>
        ) : (
          <Link to={`/p/${subplebbitAddress}/c/${cid}`}>{mediaComponent}</Link>
        )}
      </span>
    </span>
  );
};

export default Thumbnail;
