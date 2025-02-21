import React from 'react';
import { Copy, Check } from 'lucide-react';

interface CodeBlockProps {
  children: string;
  className?: string;
}

export function CodeBlock({ children, className }: CodeBlockProps) {
  const [copied, setCopied] = React.useState(false);
  const timeoutRef = React.useRef<number>();

  const handleCopy = () => {
    navigator.clipboard.writeText(children);
    setCopied(true);
    
    if (timeoutRef.current) {
      window.clearTimeout(timeoutRef.current);
    }
    
    timeoutRef.current = window.setTimeout(() => {
      setCopied(false);
    }, 2000);
  };

  React.useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        window.clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  // Extract language from className if present
  const language = className?.replace('language-', '') || '';

  return (
    <div className="relative mt-4 first:mt-0">
      <div className="absolute right-2 top-2 z-10">
        <button
          onClick={handleCopy}
          className="p-1.5 rounded bg-dark-700/50 hover:bg-dark-600/50 text-dark-300 transition-colors"
          title="Copy code"
        >
          {copied ? (
            <Check size={14} className="text-olive-400" />
          ) : (
            <Copy size={14} />
          )}
        </button>
      </div>
      {language && (
        <div className="absolute left-4 top-0 -translate-y-1/2 px-2 py-0.5 rounded text-xs font-medium bg-dark-700 text-dark-300">
          {language}
        </div>
      )}
      <pre className={`!mt-0 !mb-0 rounded-lg bg-dark-800 p-4 ${language ? 'pt-6' : ''} whitespace-pre-wrap break-all`}>
        <code className={className}>{children}</code>
      </pre>
    </div>
  );
}