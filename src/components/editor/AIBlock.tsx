import React, { useState } from 'react';
import { Block as BlockType } from '../../types/workspace';
import { AIPanel } from '../ui/ai-panel';
import { callGeminiAI, AITaskType, cleanAIResponse } from '../../lib/ai/gemini';
import { Loader2, Send, Sparkles } from 'lucide-react';

interface AIBlockProps {
  block: BlockType;
  onUpdate: (updates: Partial<BlockType>) => void;
}

// This block uses AI to help write content
// You can ask it to generate, improve, translate, or summarize text
export const AIBlock: React.FC<AIBlockProps> = ({ block, onUpdate }) => {
  const [prompt, setPrompt] = useState(block.text || '');
  const [isLoading, setIsLoading] = useState(false);

  // Call the AI with whatever task the user selected
  const handleAIAction = async (task: AITaskType, extra?: any) => {
    if (!prompt && task !== 'generate') return;
    
    setIsLoading(true);
    try {
      // Send request to Gemini AI
      const result = await callGeminiAI({
        prompt: prompt,
        task,
        targetLanguage: extra?.lang, // For translation
        tone: extra?.tone // For tone adjustment
      });
      
      // Clean up the response and update the block
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
      {/* Header with sparkly icon */}
      <div className="flex items-center gap-2 text-purple-600 dark:text-purple-400 font-medium text-sm">
        <Sparkles size={16} />
        AI Writing Assistant
      </div>
      
      {/* Text area for the prompt or AI response */}
      <textarea
        value={prompt}
        onChange={(e) => setPrompt(e.target.value)}
        placeholder="What should I write about? Or select an action below..."
        className="w-full bg-transparent focus:outline-none resize-none text-gray-900 dark:text-gray-100 min-h-[80px]"
        disabled={isLoading}
      />

      {/* AI action buttons and main submit button */}
      <div className="flex flex-col gap-2">
        {/* Panel with buttons like "Improve", "Translate", etc. */}
        <AIPanel onAction={handleAIAction} isLoading={isLoading} />
        
        {/* Main "Ask AI" button */}
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