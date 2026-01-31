'use client';

import { useState, useCallback } from 'react';

interface CopyForClaudeButtonProps {
  lessonTitle: string;
  module: string;
  content: string;
}

/**
 * Extracts code blocks from MDX content
 */
function extractCodeBlocks(content: string): string[] {
  const codeBlockRegex = /```[\w]*\n([\s\S]*?)```/g;
  const blocks: string[] = [];
  let match;

  while ((match = codeBlockRegex.exec(content)) !== null) {
    blocks.push(match[1].trim());
  }

  return blocks;
}

/**
 * Formats lesson content for Claude context
 */
function formatForClaude(lessonTitle: string, module: string, content: string): string {
  const codeBlocks = extractCodeBlocks(content);

  let formatted = `# QuantLearn Lesson Context

## Currently Learning
**Lesson:** ${lessonTitle}
**Module:** ${module.charAt(0).toUpperCase() + module.slice(1)}

## Lesson Content
${content.substring(0, 2000)}${content.length > 2000 ? '\n\n[Content truncated...]' : ''}
`;

  if (codeBlocks.length > 0) {
    formatted += `\n## Sample Code from Lesson\n`;
    codeBlocks.slice(0, 3).forEach((code, index) => {
      formatted += `\n### Example ${index + 1}\n\`\`\`\n${code}\n\`\`\`\n`;
    });
  }

  formatted += `\n---
*This context was copied from QuantLearn to help Claude understand what I'm currently studying.*
*Feel free to ask me questions about this topic or help me work through related problems!*
`;

  return formatted;
}

export default function CopyForClaudeButton({ lessonTitle, module, content }: CopyForClaudeButtonProps) {
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');

  const handleCopy = useCallback(async () => {
    const formattedContext = formatForClaude(lessonTitle, module, content);

    try {
      await navigator.clipboard.writeText(formattedContext);
      setToastMessage('Copied! Paste into Claude to share your lesson context.');
      setShowToast(true);

      // Hide toast after 3 seconds
      setTimeout(() => {
        setShowToast(false);
      }, 3000);
    } catch (error) {
      // Fallback for browsers that don't support clipboard API
      setToastMessage('Failed to copy. Please try again.');
      setShowToast(true);
      setTimeout(() => {
        setShowToast(false);
      }, 3000);
    }
  }, [lessonTitle, module, content]);

  return (
    <div className="relative">
      <button
        onClick={handleCopy}
        className="inline-flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-md font-medium transition-colors"
        aria-label="Copy lesson context for Claude"
      >
        <svg
          className="w-5 h-5"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          aria-hidden="true"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
          />
        </svg>
        Copy for Claude
      </button>

      {/* Toast Notification */}
      {showToast && (
        <div
          className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-4 py-2 bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900 text-sm rounded-lg shadow-lg whitespace-nowrap animate-fade-in"
          role="status"
          aria-live="polite"
        >
          <div className="flex items-center gap-2">
            <svg
              className="w-4 h-4 text-green-400 dark:text-green-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 13l4 4L19 7"
              />
            </svg>
            {toastMessage}
          </div>
          {/* Arrow pointing down */}
          <div className="absolute top-full left-1/2 -translate-x-1/2 border-8 border-transparent border-t-gray-900 dark:border-t-gray-100" />
        </div>
      )}
    </div>
  );
}
