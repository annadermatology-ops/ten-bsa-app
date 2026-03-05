'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';

interface CodeBlockProps {
  code: string;
  language?: string;
  fileName?: string;
}

export function CodeBlock({ code, language, fileName }: CodeBlockProps) {
  const t = useTranslations('setup');
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="rounded-lg overflow-hidden border border-[#333] my-3">
      <div className="flex items-center justify-between bg-[#2a2a2a] px-3 py-1.5">
        <span className="text-[10px] text-[#888] font-mono">
          {fileName || language || 'code'}
        </span>
        <button
          onClick={handleCopy}
          className="text-[10px] px-2 py-0.5 rounded bg-[#444] text-[#ccc] hover:bg-[#555]
                     transition-colors cursor-pointer"
        >
          {copied ? t('copied') : t('copy')}
        </button>
      </div>
      <pre className="bg-[#1a1a1a] text-[#e0e0e0] text-[11px] leading-relaxed p-3 overflow-x-auto max-h-80">
        <code>{code}</code>
      </pre>
    </div>
  );
}
