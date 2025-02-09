import type { ComponentProps } from 'react';
import React, { useEffect, useState } from 'react';
import { marked, Renderer } from 'marked';
import DOMPurify from 'dompurify';
import type { DOMNode } from 'html-react-parser';
import parse, { domToReact, Element } from 'html-react-parser';

import { NativeLink } from '@frontend/commons/components/pontoon/NativeLink';

async function renderMarkdown(markdown: string) {
  const renderer = new Renderer();
  const defaultLinkRenderer = renderer.link;
  renderer.link = (linkTokens) => {
    return defaultLinkRenderer
      .call(renderer, linkTokens)
      .replace(/^<a /, '<a target="_blank" rel="noopener noreferrer" ');
  };
  const html = await marked(markdown, { renderer });
  return DOMPurify.sanitize(html, { ADD_ATTR: ['target'] });
}

function wrapLinks(domNode: DOMNode): React.JSX.Element | void {
  if (
    domNode instanceof Element &&
    domNode.name === 'a' &&
    domNode.attribs?.href
  ) {
    return (
      <NativeLink
        href={domNode.attribs.href}
        target="_blank"
        rel="noopener noreferrer"
      >
        {domToReact(domNode.children as DOMNode[])}
      </NativeLink>
    );
  }
}

interface Props extends ComponentProps<'div'> {
  markdownText: string;
}

export const MarkdownContent: React.FC<Props> = ({
  markdownText,
  ...props
}) => {
  const [htmlToRender, setHtmlToRender] = useState('');

  useEffect(() => {
    (async () => {
      setHtmlToRender(await renderMarkdown(markdownText));
    })();
  }, [markdownText]);

  return <div {...props}>{parse(htmlToRender, { replace: wrapLinks })}</div>;
};
