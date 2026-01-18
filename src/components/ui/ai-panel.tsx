import React from 'react';
import { Button } from './button';
import { Sparkles, Languages, FileText, Wand2, ArrowRight } from 'lucide-react';
import { AITaskType } from '../../lib/ai/gemini';

// Props interface for the AIPanel component
// This defines what data the component needs to work properly
interface AIPanelProps {
  onAction: (task: AITaskType, extra?: any) => void; // Callback function that gets triggered when user clicks an AI action button
  isLoading: boolean; // Flag to disable buttons while AI is processing
}

/**
 * AIPanel Component
 * 
 * This is a floating panel that shows up when you want to use AI features on your text.
 * It provides quick actions like improving writing, summarizing, translating, etc.
 * Think of it as a toolbar for AI-powered text editing.
 * 
 * The panel appears with a nice purple theme to stand out from the regular editor.
 */
export const AIPanel: React.FC<AIPanelProps> = ({ onAction, isLoading }) => {
  return (
    // Main container with purple background and border
    // The animate-in classes make it slide in smoothly from the top
    <div className="flex flex-wrap gap-2 p-2 bg-purple-50 dark:bg-purple-900/10 border border-purple-100 dark:border-purple-900/30 rounded-lg animate-in fade-in slide-in-from-top-1">
      
      {/* Improve Writing Button */}
      {/* Uses the magic wand icon because it makes the text better like magic */}
      <Button 
        variant="ghost" 
        size="sm" 
        onClick={() => onAction('improve')}
        disabled={isLoading} // Can't click while another AI task is running
        className="text-xs gap-1"
      >
        <Wand2 size={14} className="text-purple-500" />
        Improve Writing
      </Button>

      {/* Summarize Button */}
      {/* Takes long text and makes it shorter while keeping the main points */}
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

      {/* Translate Button */}
      {/* Currently hardcoded to Spanish but could be expanded to more languages */}
      <Button 
        variant="ghost" 
        size="sm" 
        onClick={() => onAction('translate', { lang: 'Spanish' })} // Pass the target language as extra data
        disabled={isLoading}
        className="text-xs gap-1"
      >
        <Languages size={14} className="text-green-500" />
        Translate to Spanish
      </Button>

      {/* Make Professional Button */}
      {/* Changes the tone of the text to sound more formal and business-like */}
      <Button 
        variant="ghost" 
        size="sm" 
        onClick={() => onAction('tone', { tone: 'professional' })} // Pass the desired tone
        disabled={isLoading}
        className="text-xs gap-1"
      >
        <ArrowRight size={14} className="text-orange-500" />
        Make Professional
      </Button>
    </div>
  );
};