import React, { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import remarkGfm from 'remark-gfm';
import supersub from 'remark-supersub';
import ReactMarkdown, { Components } from 'react-markdown';
import rehypeSanitize, { defaultSchema } from 'rehype-sanitize';
import styles from './markdown.module.css';
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

      const displayText = shouldReplaceText ? internalPath : children;
      return <Link to={internalPath}>{displayText}</Link>;
    } else {
      console.warn('Failed to transform seedit link to internal path:', href);
      return <Link to={href}>{children}</Link>;
    }
  }

  // Handle hash routes and internal patterns
  if (href.startsWith('#/') || href.startsWith('/p/') || href.match(/^\/p\/[^/]+(\/c\/[^/]+)?$/)) {
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
    <span className={styles.markdown}>
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
