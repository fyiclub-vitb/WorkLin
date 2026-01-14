import React from 'react';
import { Button } from './button';
import { Sparkles, Languages, FileText, Wand2, ArrowRight } from 'lucide-react';
import { AITaskType } from '../../lib/ai/gemini';

interface AIPanelProps {
  onAction: (task: AITaskType, extra?: any) => void;
  isLoading: boolean;
}

export const AIPanel: React.FC<AIPanelProps> = ({ onAction, isLoading }) => {
  return (
    <div className="flex flex-wrap gap-2 p-2 bg-purple-50 dark:bg-purple-900/10 border border-purple-100 dark:border-purple-900/30 rounded-lg animate-in fade-in slide-in-from-top-1">
      <Button 
        variant="ghost" 
        size="sm" 
        onClick={() => onAction('improve')}
        disabled={isLoading}
        className="text-xs gap-1"
      >
        <Wand2 size={14} className="text-purple-500" />
        Improve Writing
      </Button>
      <Button 
        variant="ghost" 
        size="sm" 
        onClick={() => onAction('summarize')}
        disabled={isLoading}
        className="text-xs gap-1"
      >
        <FileText size={14} className="text-blue-500" />
        Summarize
      </Button>
      <Button 
        variant="ghost" 
        size="sm" 
        onClick={() => onAction('translate', { lang: 'Spanish' })}
        disabled={isLoading}
        className="text-xs gap-1"
      >
        <Languages size={14} className="text-green-500" />
        Translate to Spanish
      </Button>
      <Button 
        variant="ghost" 
        size="sm" 
        onClick={() => onAction('tone', { tone: 'professional' })}
        disabled={isLoading}
        className="text-xs gap-1"
      >
        <ArrowRight size={14} className="text-orange-500" />
        Make Professional
      </Button>
    </div>
  );
};