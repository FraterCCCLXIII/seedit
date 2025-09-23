import React, { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import remarkGfm from 'remark-gfm';
import supersub from 'remark-supersub';
import ReactMarkdown, { Components } from 'react-markdown';
import rehypeSanitize, { defaultSchema } from 'rehype-sanitize';
// Removed CSS modules import - converted to Tailwind classes
import rehypeRaw from 'rehype-raw';
import SpoilerTooltip from '../spoiler-tooltip';
import { isSeeditLink, transformSeeditLinkToInternal, preprocessSeeditPatterns } from '../../lib/utils/url-utils';

interface MarkdownProps {
  content: string;
}

interface ExtendedComponents extends Components {
  spoiler: React.ComponentType<{ children: React.ReactNode }>;
}

const MAX_LENGTH_FOR_GFM = 10000; // remarkGfm lags with large content

const spoilerTransform = () => (tree: any) => {
  const visit = (node: any) => {
    if (node.tagName === 'spoiler') {
      node.tagName = 'span';
      node.properties = node.properties || {};
      node.properties.className = 'spoilertext';
    }

    if (node.children) {
      node.children.forEach(visit);
    }
  };

  if (tree.children) {
    tree.children.forEach(visit);
  }
};

const SpoilerText = ({ children }: { children: React.ReactNode }) => {
  const [revealed, setRevealed] = useState(false);

  return (
    <SpoilerTooltip
      children={
        <span className={revealed ? 'spoilerTextRevealed' : 'spoilerText'} onClick={() => setRevealed(true)}>
          {children}
        </span>
      }
      content='Reveal spoiler'
      showTooltip={!revealed}
    />
  );
};

const renderAnchorLink = (children: React.ReactNode, href: string) => {
  if (!href) {
    return <span>{children}</span>;
  }

  // Check if this is a valid seedit link that should be handled internally
  if (isSeeditLink(href)) {
    const internalPath = transformSeeditLinkToInternal(href);
    if (internalPath) {
      // Check if the link text should be replaced with the internal path
      let shouldReplaceText = false;

      if (typeof children === 'string') {
        shouldReplaceText = children === href || children.trim() === href.trim();
      } else if (Array.isArray(children) && children.length === 1 && typeof children[0] === 'string') {
        shouldReplaceText = children[0] === href || children[0].trim() === href.trim();
      }

      // For display purposes, remove leading slash from paths like "/p/something"
      let displayText: React.ReactNode = children;
      if (shouldReplaceText && internalPath.startsWith('/p/')) {
        displayText = internalPath.substring(1); // Remove leading slash
      } else if (shouldReplaceText) {
        displayText = internalPath;
      }

      return <Link to={internalPath}>{displayText}</Link>;
    } else {
      console.warn('Failed to transform seedit link to internal path:', href);
      return <Link to={href}>{children}</Link>;
    }
  }

  // Handle hash routes and internal patterns (including routes that start with /#/)
  if (href.startsWith('#/') || href.startsWith('/#/') || href.startsWith('/p/') || href.match(/^\/p\/[^/]+(\/c\/[^/]+)?$/)) {
    return <Link to={href}>{children}</Link>;
  }

  // External links
  return (
    <a href={href} target='_blank' rel='noopener noreferrer'>
      {children}
    </a>
  );
};

const Markdown = ({ content }: MarkdownProps) => {
  // Preprocess content to convert plain text seedit patterns to markdown links
  const preprocessedContent = useMemo(() => preprocessSeeditPatterns(content), [content]);

  const remarkPlugins: any[] = [[supersub]];

  if (preprocessedContent && preprocessedContent.length <= MAX_LENGTH_FOR_GFM) {
    remarkPlugins.push([remarkGfm, { singleTilde: false }]);
  }

  remarkPlugins.push([spoilerTransform]);

  const customSchema = useMemo(
    () => ({
      ...defaultSchema,
      tagNames: [...(defaultSchema.tagNames || []), 'span', 'spoiler'],
      attributes: {
        ...defaultSchema.attributes,
        span: ['className'],
        spoiler: [],
      },
    }),
    [],
  );

  return (
    <span className='markdown-content [&_a]:text-blue-600 dark:[&_a]:text-blue-400 [&_ol]:pl-10 [&_ol]:whitespace-normal [&_ol]:pb-1.5 [&_ul]:pl-10 [&_ul]:whitespace-normal [&_ul]:pb-1.5 [&_blockquote]:px-2 [&_blockquote]:ml-1.5 [&_blockquote]:border-l-2 [&_blockquote]:border-gray-400 dark:[&_blockquote]:border-gray-600 [&_blockquote]:text-gray-600 dark:[&_blockquote]:text-gray-400 [&_blockquote]:whitespace-normal [&_blockquote]:flow-root [&_blockquote]:mb-1.5 [&_blockquote>p:last-child]:mb-0 [&_blockquote_blockquote>p:last-child]:mb-1.5 [&_blockquote>blockquote:last-child]:mb-0 [&_li]:whitespace-normal [&_h1]:text-lg [&_h1]:mb-4 [&_h2]:text-lg [&_h2]:font-normal [&_h2]:mb-4 [&_h3]:text-base [&_h3]:mb-2.5 [&_h4]:text-base [&_h4]:font-normal [&_h4]:mb-2.5 [&_h5]:text-sm [&_h5]:mb-2.5 [&_h6]:text-sm [&_h6]:font-normal [&_h6]:underline [&_h6]:mb-2.5 [&_p]:mb-1.5 [&_pre]:border [&_pre]:border-gray-300 dark:[&_pre]:border-gray-600 [&_pre]:bg-gray-100 dark:[&_pre]:bg-gray-800 [&_pre]:rounded-sm [&_pre]:my-1.5 [&_pre]:px-2.5 [&_pre]:py-1 [&_pre]:overflow-hidden [&_code:not(pre_code)]:border [&_code:not(pre_code)]:border-gray-300 dark:[&_code:not(pre_code)]:border-gray-600 [&_code:not(pre_code)]:bg-gray-100 dark:[&_code:not(pre_code)]:bg-gray-800 [&_code:not(pre_code)]:rounded-sm [&_code:not(pre_code)]:my-1.5 [&_code:not(pre_code)]:px-1'>
      <ReactMarkdown
        children={preprocessedContent}
        remarkPlugins={remarkPlugins}
        rehypePlugins={[[rehypeRaw as any], [rehypeSanitize, customSchema]]}
        components={
          {
            a: ({ children, href }) => renderAnchorLink(children, href || ''),
            p: ({ children }) => {
              const isEmpty =
                !children ||
                (Array.isArray(children) && children.every((child) => child === null || child === undefined || (typeof child === 'string' && child.trim() === '')));

              return !isEmpty && <p>{children}</p>;
            },
            img: ({ src, alt }) => {
              const displayText = src || alt || 'image';
              return <span>{displayText}</span>;
            },
            video: ({ src }) => <span>{src}</span>,
            iframe: ({ src }) => <span>{src}</span>,
            source: ({ src }) => <span>{src}</span>,
            spoiler: ({ children }) => <SpoilerText>{children}</SpoilerText>,
          } as ExtendedComponents
        }
      />
    </span>
  );
};

export default React.memo(Markdown);
