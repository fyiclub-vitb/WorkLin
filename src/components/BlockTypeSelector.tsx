import React from 'react';
import { BlockType } from '../types/workspace';
import {
  Type, Heading1, Heading2, Heading3, List, CheckSquare,
  Sparkles, Calculator, Link as LinkIcon, Code2
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from './ui/dropdown-menu';

interface BlockTypeSelectorProps {
  currentType: BlockType;
  onChange: (type: BlockType) => void;
}

const blockTypes: {
  type: BlockType;
  label: string;
  icon: React.ReactNode;
  category: 'basic' | 'advanced';
}[] = [
    // Basic
    { type: 'paragraph', label: 'Text', icon: <Type size={16} />, category: 'basic' },
    { type: 'heading1', label: 'Heading 1', icon: <Heading1 size={16} />, category: 'basic' },
    { type: 'heading2', label: 'Heading 2', icon: <Heading2 size={16} />, category: 'basic' },
    { type: 'heading3', label: 'Heading 3', icon: <Heading3 size={16} />, category: 'basic' },
    { type: 'bulleted-list', label: 'Bulleted List', icon: <List size={16} />, category: 'basic' },
    { type: 'checkbox', label: 'To-do', icon: <CheckSquare size={16} />, category: 'basic' },

    // Advanced
    { type: 'code-enhanced', label: 'Code Block', icon: <Code2 size={16} className="text-green-600" />, category: 'advanced' },
    { type: 'equation', label: 'Equation', icon: <Calculator size={16} className="text-purple-600" />, category: 'advanced' },
    { type: 'embed', label: 'Embed', icon: <LinkIcon size={16} className="text-blue-600" />, category: 'advanced' },
    { type: 'ai', label: 'AI Assistant', icon: <Sparkles size={16} className="text-purple-500" />, category: 'advanced' },
  ];

export const BlockTypeSelector: React.FC<BlockTypeSelectorProps> = ({
  currentType,
  onChange,
}) => {
  const currentBlock = blockTypes.find((b) => b.type === currentType) || blockTypes[0];
  const basicBlocks = blockTypes.filter(b => b.category === 'basic');
  const advancedBlocks = blockTypes.filter(b => b.category === 'advanced');

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button className="flex items-center gap-1.5 px-2 py-1 text-xs text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-700 rounded transition-colors">
          {currentBlock.icon}
          <span className="hidden sm:inline">{currentBlock.label}</span>
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-56">
        <DropdownMenuLabel className="text-xs">Basic Blocks</DropdownMenuLabel>
        {basicBlocks.map((blockType) => (
          <DropdownMenuItem
            key={blockType.type}
            onClick={() => onChange(blockType.type)}
            className={`flex items-center gap-2 cursor-pointer ${currentType === blockType.type ? 'bg-blue-50 dark:bg-blue-900/20' : ''
              }`}
          >
            {blockType.icon}
            <span>{blockType.label}</span>
          </DropdownMenuItem>
        ))}
        <DropdownMenuSeparator />

        <DropdownMenuLabel className="text-xs">Advanced Blocks</DropdownMenuLabel>
        {advancedBlocks.map((blockType) => (
          <DropdownMenuItem
            key={blockType.type}
            onClick={() => onChange(blockType.type)}
            className={`flex items-center gap-2 cursor-pointer ${currentType === blockType.type ? 'bg-blue-50 dark:bg-blue-900/20' : ''
              }`}
          >
            {blockType.icon}
            <span>{blockType.label}</span>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};