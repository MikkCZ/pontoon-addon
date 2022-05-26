import React, { useEffect, useState } from 'react';
import type { Renderer } from 'marked';
import { marked } from 'marked';
import DOMPurify from 'dompurify';

function renderMarkdown(markdown: string) {
  const renderer = new marked.Renderer();
  const defaultLinkRenderer = renderer.link;
  renderer.link = function (
    this: Renderer<never>,
    href: string | null,
    title: string | null,
    text: string,
  ): string {
    return defaultLinkRenderer
      .call(this, href, title, text)
      .replace(/^<a /, '<a target="_blank" rel="noreferrer" ');
  };
  const html = marked(markdown, { renderer });
  return DOMPurify.sanitize(html, { ADD_ATTR: ['target'] });
}

interface Props {
  markdownText: string;
}

export const MarkdownContent: React.FC<Props> = ({ markdownText }) => {
  const [markdownContent, setMarkdownContent] = useState<string>();

  useEffect(() => {
    (async () => {
      setMarkdownContent(markdownText);
    })();
  }, [markdownText]);

  const html = markdownContent ? renderMarkdown(markdownContent) : '';
  return <div dangerouslySetInnerHTML={{ __html: html }} />;
};
