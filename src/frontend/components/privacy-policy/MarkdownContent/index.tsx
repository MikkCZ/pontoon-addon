import React, { useEffect, useState } from 'react';
import { marked, Renderer } from 'marked';
import DOMPurify from 'dompurify';

async function getTextContent(file: string): Promise<string> {
  return (await fetch(file)).text();
}

function renderMarkdown(markdown: string) {
  const renderer = new marked.Renderer();
  const defaultLinkRenderer = renderer.link;
  renderer.link = function (
    this: Renderer<never>,
    href: string | null,
    title: string | null,
    text: string
  ): string {
    return defaultLinkRenderer
      .call(this, href, title, text)
      .replace(/^<a /, '<a target="_blank" rel="noreferrer" ');
  };
  const html = marked(markdown, { renderer });
  return DOMPurify.sanitize(html, { ADD_ATTR: ['target'] });
}

interface Props {
  markdownFile: string;
}

export const MarkdownContent: React.FC<Props> = ({ markdownFile }) => {
  const [markdownContent, setMarkdownContent] = useState<string>();

  useEffect(() => {
    (async () => {
      setMarkdownContent(await getTextContent(markdownFile));
    })();
  }, [markdownFile]);

  const html = markdownContent ? renderMarkdown(markdownContent) : '';
  return <div dangerouslySetInnerHTML={{ __html: html }} />;
};
