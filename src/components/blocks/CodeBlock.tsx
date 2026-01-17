import React, { useState, useEffect } from 'react';
import { Block as BlockType } from '../../types/workspace';
import { Code, Copy, Check } from 'lucide-react';
import Prism from 'prismjs';
import 'prismjs/themes/prism-tomorrow.css';

// Import all the language grammars we want to support
import 'prismjs/components/prism-javascript';
import 'prismjs/components/prism-typescript';
import 'prismjs/components/prism-jsx';
import 'prismjs/components/prism-tsx';
import 'prismjs/components/prism-python';
import 'prismjs/components/prism-java';
import 'prismjs/components/prism-c';
import 'prismjs/components/prism-cpp';
import 'prismjs/components/prism-csharp';
import 'prismjs/components/prism-go';
import 'prismjs/components/prism-rust';
import 'prismjs/components/prism-sql';
import 'prismjs/components/prism-json';
import 'prismjs/components/prism-yaml';
import 'prismjs/components/prism-markdown';
import 'prismjs/components/prism-bash';

interface CodeBlockProps {
  block: BlockType;
  onUpdate: (updates: Partial<BlockType>) => void;
}

// List of all programming languages we support
const LANGUAGES = [
  { value: 'javascript', label: 'JavaScript' },
  { value: 'typescript', label: 'TypeScript' },
  { value: 'jsx', label: 'JSX' },
  { value: 'tsx', label: 'TSX' },
  { value: 'python', label: 'Python' },
  { value: 'java', label: 'Java' },
  { value: 'c', label: 'C' },
  { value: 'cpp', label: 'C++' },
  { value: 'csharp', label: 'C#' },
  { value: 'go', label: 'Go' },
  { value: 'rust', label: 'Rust' },
  { value: 'sql', label: 'SQL' },
  { value: 'html', label: 'HTML' },
  { value: 'css', label: 'CSS' },
  { value: 'json', label: 'JSON' },
  { value: 'yaml', label: 'YAML' },
  { value: 'markdown', label: 'Markdown' },
  { value: 'bash', label: 'Bash' },
];

// This component shows code with syntax highlighting, line numbers, and copy button
export const CodeBlock: React.FC<CodeBlockProps> = ({ block, onUpdate }) => {
  // Keep track of the code content and selected language
  const [code, setCode] = useState(block.text || '');
  const [language, setLanguage] = useState(block.properties?.language || 'javascript');
  const [copied, setCopied] = useState(false); // For the "Copied!" feedback
  const [highlightedCode, setHighlightedCode] = useState('');

  // Re-highlight the code whenever it changes or language changes
  useEffect(() => {
    if (code && Prism.languages[language]) {
      // Use Prism to add syntax highlighting
      const highlighted = Prism.highlight(
        code,
        Prism.languages[language],
        language
      );
      setHighlightedCode(highlighted);
    } else {
      // No highlighting available for this language
      setHighlightedCode(code);
    }
  }, [code, language]);

  // Update the block whenever code changes
  const handleCodeChange = (newCode: string) => {
    setCode(newCode);
    onUpdate({
      text: newCode,
      content: newCode,
      properties: { ...block.properties, language }
    });
  };

  // Update language selection
  const handleLanguageChange = (newLanguage: string) => {
    setLanguage(newLanguage);
    onUpdate({
      properties: { ...block.properties, language: newLanguage }
    });
  };

  // Copy code to clipboard
  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      // Reset the "Copied!" message after 2 seconds
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy code:', err);
    }
  };

  return (
    <div className="group relative rounded-lg overflow-hidden border border-gray-700 bg-[#2d2d2d]">
      {/* Top bar with language selector and copy button */}
      <div className="flex items-center justify-between px-4 py-2 bg-[#1e1e1e] border-b border-gray-700">
        <div className="flex items-center gap-3">
          <Code size={16} className="text-gray-400" />
          {/* Dropdown to pick the programming language */}
          <select
            value={language}
            onChange={(e) => handleLanguageChange(e.target.value)}
            className="bg-transparent text-sm text-gray-300 border-none focus:outline-none cursor-pointer hover:text-white transition-colors"
          >
            {LANGUAGES.map((lang) => (
              <option key={lang.value} value={lang.value} className="bg-[#1e1e1e]">
                {lang.label}
              </option>
            ))}
          </select>
        </div>
        
        {/* Copy button that shows checkmark when clicked */}
        <button
          onClick={handleCopy}
          className="flex items-center gap-2 px-2 py-1 text-xs text-gray-400 hover:text-white transition-colors rounded hover:bg-gray-700"
          title="Copy code"
        >
          {copied ? (
            <>
              <Check size={14} className="text-green-400" />
              <span className="text-green-400">Copied!</span>
            </>
          ) : (
            <>
              <Copy size={14} />
              <span>Copy</span>
            </>
          )}
        </button>
      </div>

      {/* Main code editor area */}
      <div className="relative">
        {/* Line numbers on the left */}
        <div className="absolute left-0 top-0 bottom-0 w-12 bg-[#1e1e1e] border-r border-gray-700 select-none overflow-hidden">
          <div className="py-3 px-2 text-right text-xs text-gray-600 font-mono leading-6">
            {code.split('\n').map((_, i) => (
              <div key={i}>{i + 1}</div>
            ))}
          </div>
        </div>

        {/* Actual textarea where you type code */}
        <textarea
          value={code}
          onChange={(e) => handleCodeChange(e.target.value)}
          placeholder="// Start typing your code..."
          className="w-full pl-14 pr-4 py-3 bg-transparent text-sm text-gray-100 font-mono resize-none focus:outline-none leading-6 min-h-[200px]"
          style={{
            tabSize: 2, // Tab inserts 2 spaces
            MozTabSize: 2,
          }}
          spellCheck={false} // Turn off spell check for code
          onKeyDown={(e) => {
            // Custom tab handling - insert 2 spaces instead of default tab
            if (e.key === 'Tab') {
              e.preventDefault();
              const start = e.currentTarget.selectionStart;
              const end = e.currentTarget.selectionEnd;
              const newCode = code.substring(0, start) + '  ' + code.substring(end);
              setCode(newCode);
              handleCodeChange(newCode);
              // Move cursor after the inserted spaces
              setTimeout(() => {
                e.currentTarget.selectionStart = e.currentTarget.selectionEnd = start + 2;
              }, 0);
            }
          }}
        />

        {/* Syntax highlighted overlay - shows colored code on top */}
        {highlightedCode && (
          <pre
            className="absolute top-0 left-0 w-full h-full pl-14 pr-4 py-3 pointer-events-none overflow-hidden"
            aria-hidden="true" // Hidden from screen readers
          >
            <code
              className={`language-${language} text-sm font-mono leading-6`}
              dangerouslySetInnerHTML={{ __html: highlightedCode }}
            />
          </pre>
        )}
      </div>

      {/* Bottom info bar showing line count and character count */}
      <div className="px-4 py-2 bg-[#1e1e1e] border-t border-gray-700 text-xs text-gray-500">
        {code.split('\n').length} lines · {code.length} characters
      </div>
    </div>
  );
};