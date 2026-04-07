import React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

interface MarkdownRendererProps {
  content: string;
}

export function MarkdownRenderer({ content }: MarkdownRendererProps) {
  return (
    <div className="prose prose-invert prose-lg max-w-none
      prose-headings:text-foreground prose-headings:font-bold
      prose-p:text-muted-foreground prose-p:leading-relaxed
      prose-a:text-primary prose-a:no-underline hover:prose-a:underline
      prose-strong:text-foreground
      prose-ul:text-muted-foreground prose-ol:text-muted-foreground
      prose-li:marker:text-primary
      prose-blockquote:border-l-4 prose-blockquote:border-primary/30 prose-blockquote:pl-4 prose-blockquote:italic prose-blockquote:text-muted-foreground
      prose-code:text-primary prose-code:bg-secondary prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded
      prose-img:rounded-xl prose-img:border prose-img:border-border prose-img:max-w-full
    ">
      <ReactMarkdown remarkPlugins={[remarkGfm]}>{content}</ReactMarkdown>
    </div>
  );
}
