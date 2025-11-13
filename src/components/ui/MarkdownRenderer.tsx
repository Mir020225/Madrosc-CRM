
import React from 'react';

// A very basic markdown-to-HTML renderer. For a real app, use a library like 'marked' or 'react-markdown'.
const basicMarkdownParser = (text: string) => {
    let html = text
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>') // Bold
      .replace(/\*(.*?)\*/g, '<em>$1</em>') // Italic
      .replace(/^### (.*$)/gim, '<h3 class="text-lg font-semibold mb-2">$1</h3>') // H3
      .replace(/^## (.*$)/gim, '<h2 class="text-xl font-bold mb-3">$1</h2>') // H2
      .replace(/^# (.*$)/gim, '<h1 class="text-2xl font-bold mb-4">$1</h1>') // H1
      .replace(/^\s*[-*] (.*$)/gim, '<li class="ml-4 list-disc">$1</li>') // List items
      .replace(/(\<li.*\>.*<\/li\>)/gs, '<ul>$1</ul>') // Wrap LIs in UL
      .replace(/\n/g, '<br />'); // New lines
      
    // Fix nested lists by removing outer br tags around ul
    html = html.replace(/<br \/><ul>/g, '<ul>').replace(/<\/ul><br \/>/g, '</ul>');

    return html;
};

interface MarkdownRendererProps {
  content: string;
  className?: string;
}

const MarkdownRenderer: React.FC<MarkdownRendererProps> = ({ content, className = '' }) => {
  const htmlContent = basicMarkdownParser(content);

  return (
    <div
      className={`prose prose-sm max-w-none ${className}`}
      dangerouslySetInnerHTML={{ __html: htmlContent }}
    />
  );
};

export default MarkdownRenderer;