import React, { useState } from 'react';
import { Block as BlockType } from '../../types/workspace';
import { AIPanel } from '../ui/ai-panel';
import { callGeminiAI, AITaskType, cleanAIResponse } from '../../lib/ai/gemini';
import { Loader2, Send, Sparkles } from 'lucide-react'; // Added Sparkles here

interface AIBlockProps {
  block: BlockType;
  onUpdate: (updates: Partial<BlockType>) => void;
}

export const AIBlock: React.FC<AIBlockProps> = ({ block, onUpdate }) => {
  const [prompt, setPrompt] = useState(block.text || '');
  const [isLoading, setIsLoading] = useState(false);

  const handleAIAction = async (task: AITaskType, extra?: any) => {
    if (!prompt && task !== 'generate') return;
    
    setIsLoading(true);
    try {
      const result = await callGeminiAI({
        prompt: prompt,
        task,
        targetLanguage: extra?.lang,
        tone: extra?.tone
      });
      
      const cleanedText = cleanAIResponse(result);
      onUpdate({ text: cleanedText, content: cleanedText });
      setPrompt(cleanedText);
    } catch (err) {
      console.error(err);
      alert("AI request failed. Please check if your Firebase Functions are deployed.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-3 p-3 border-2 border-purple-200 dark:border-purple-900/50 rounded-xl bg-white dark:bg-gray-900 shadow-sm">
      <div className="flex items-center gap-2 text-purple-600 dark:text-purple-400 font-medium text-sm">
        <Sparkles size={16} /> {/* This was causing the crash */}
        AI Writing Assistant
      </div>
      
      <textarea
        value={prompt}
        onChange={(e) => setPrompt(e.target.value)}
        placeholder="What should I write about? Or select an action below..."
        className="w-full bg-transparent focus:outline-none resize-none text-gray-900 dark:text-gray-100 min-h-[80px]"
        disabled={isLoading}
      />

      <div className="flex flex-col gap-2">
        <AIPanel onAction={handleAIAction} isLoading={isLoading} />
        
        <div className="flex justify-end">
          <button 
            onClick={() => handleAIAction('generate')}
            disabled={isLoading || !prompt}
            className="flex items-center gap-2 px-4 py-1.5 bg-purple-600 hover:bg-purple-700 disabled:bg-purple-300 text-white rounded-lg text-sm transition-colors"
          >
            {isLoading ? <Loader2 size={14} className="animate-spin" /> : <Send size={14} />}
            Ask AI
          </button>
        </div>
      </div>
    </div>
  );
};