import React from 'react';
import { BlockType } from '../types/workspace';
import { Type, Heading1, Heading2, Heading3, List, CheckSquare, Sparkles } from 'lucide-react'; // Added Sparkles
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from './ui/dropdown-menu';

interface BlockTypeSelectorProps {
  currentType: BlockType;
  onChange: (type: BlockType) => void;
}

const blockTypes: { type: BlockType; label: string; icon: React.ReactNode }[] = [
  { type: 'paragraph', label: 'Text', icon: <Type size={16} /> },
  { type: 'heading1', label: 'Heading 1', icon: <Heading1 size={16} /> },
  { type: 'heading2', label: 'Heading 2', icon: <Heading2 size={16} /> },
  { type: 'heading3', label: 'Heading 3', icon: <Heading3 size={16} /> },
  { type: 'bulleted-list', label: 'Bulleted List', icon: <List size={16} /> },
  { type: 'checkbox', label: 'To-do', icon: <CheckSquare size={16} /> },
  { type: 'ai', label: 'AI Assistant', icon: <Sparkles size={16} className="text-purple-500" /> }, // Added AI
];

export const BlockTypeSelector: React.FC<BlockTypeSelectorProps> = ({
  currentType,
  onChange,
}) => {
  const currentBlock = blockTypes.find((b) => b.type === currentType) || blockTypes[0];

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button className="flex items-center gap-1.5 px-2 py-1 text-xs text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-700 rounded transition-colors">
          {currentBlock.icon}
          <span className="hidden sm:inline">{currentBlock.label}</span>
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-48">
        {blockTypes.map((blockType) => (
          <DropdownMenuItem
            key={blockType.type}
            onClick={() => onChange(blockType.type)}
            className={`flex items-center gap-2 cursor-pointer ${
              currentType === blockType.type ? 'bg-blue-50 dark:bg-blue-900/20' : ''
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