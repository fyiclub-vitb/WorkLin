import React, { useState, useEffect } from 'react';
import { Block as BlockType } from '../../types/workspace';
import { Calculator, Edit2, Eye } from 'lucide-react';

interface EquationBlockProps {
  block: BlockType;
  onUpdate: (updates: Partial<BlockType>) => void;
}

export const EquationBlock: React.FC<EquationBlockProps> = ({ block, onUpdate }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [latex, setLatex] = useState(block.text || '');
  const [renderedHtml, setRenderedHtml] = useState('');
  const [error, setError] = useState('');

  // Load KaTeX dynamically
  useEffect(() => {
    const loadKaTeX = async () => {
      try {
        // Dynamically import KaTeX
        const katex = await import('katex');
        const katexCss = document.querySelector('link[href*="katex"]');
        
        if (!katexCss) {
          const link = document.createElement('link');
          link.rel = 'stylesheet';
          link.href = 'https://cdn.jsdelivr.net/npm/katex@0.16.9/dist/katex.min.css';
          document.head.appendChild(link);
        }

        if (latex) {
          try {
            const html = katex.default.renderToString(latex, {
              throwOnError: false,
              displayMode: true,
              output: 'html',
            });
            setRenderedHtml(html);
            setError('');
          } catch (err: any) {
            setError(err.message);
            setRenderedHtml('');
          }
        }
      } catch (err) {
        console.error('Failed to load KaTeX:', err);
        setError('Failed to load equation renderer');
      }
    };

    loadKaTeX();
  }, [latex]);

  const handleSave = () => {
    onUpdate({ 
      text: latex,
      content: latex,
      properties: { ...block.properties, latex }
    });
    setIsEditing(false);
  };

  const handleCancel = () => {
    setLatex(block.text || '');
    setIsEditing(false);
  };

  return (
    <div className="group relative p-4 border-2 border-purple-200 dark:border-purple-900/50 rounded-lg bg-purple-50/30 dark:bg-purple-900/10">
      <div className="flex items-center gap-2 mb-2">
        <Calculator size={16} className="text-purple-600 dark:text-purple-400" />
        <span className="text-sm font-medium text-purple-700 dark:text-purple-300">
          LaTeX Equation
        </span>
        <div className="ml-auto flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            onClick={() => setIsEditing(!isEditing)}
            className="p-1 hover:bg-purple-200 dark:hover:bg-purple-800 rounded text-purple-600 dark:text-purple-400"
            title={isEditing ? 'Preview' : 'Edit'}
          >
            {isEditing ? <Eye size={14} /> : <Edit2 size={14} />}
          </button>
        </div>
      </div>

      {isEditing ? (
        <div className="space-y-2">
          <textarea
            value={latex}
            onChange={(e) => setLatex(e.target.value)}
            placeholder="Enter LaTeX equation (e.g., E = mc^2)"
            className="w-full min-h-[80px] px-3 py-2 bg-white dark:bg-gray-900 border border-purple-300 dark:border-purple-700 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 font-mono text-sm"
          />
          {error && (
            <div className="text-xs text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 p-2 rounded">
              {error}
            </div>
          )}
          <div className="flex gap-2">
            <button
              onClick={handleSave}
              className="px-3 py-1.5 bg-purple-600 hover:bg-purple-700 text-white rounded-md text-sm transition-colors"
            >
              Save
            </button>
            <button
              onClick={handleCancel}
              className="px-3 py-1.5 bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-md text-sm transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      ) : (
        <div className="overflow-x-auto">
          {renderedHtml ? (
            <div
              className="katex-rendered text-center py-4"
              dangerouslySetInnerHTML={{ __html: renderedHtml }}
            />
          ) : (
            <div className="text-center py-8 text-gray-400 dark:text-gray-600 text-sm">
              Click edit to add a LaTeX equation
            </div>
          )}
        </div>
      )}

      <div className="mt-2 text-xs text-gray-500 dark:text-gray-500">
        Examples: x^2 + y^2 = z^2 | \frac{'{a}{b}'} | \sum_{'{i=1}'}^{'{n}'} i
      </div>
    </div>
  );
};