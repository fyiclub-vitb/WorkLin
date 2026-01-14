import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from 'react';
import { AIPanel } from '../ui/ai-panel';
import { callGeminiAI, cleanAIResponse } from '../../lib/ai/gemini';
import { Loader2, Send, Sparkles } from 'lucide-react'; // Added Sparkles here
export const AIBlock = ({ block, onUpdate }) => {
    const [prompt, setPrompt] = useState(block.text || '');
    const [isLoading, setIsLoading] = useState(false);
    const handleAIAction = async (task, extra) => {
        if (!prompt && task !== 'generate')
            return;
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
        }
        catch (err) {
            console.error(err);
            alert("AI request failed. Please check if your Firebase Functions are deployed.");
        }
        finally {
            setIsLoading(false);
        }
    };
    return (_jsxs("div", { className: "space-y-3 p-3 border-2 border-purple-200 dark:border-purple-900/50 rounded-xl bg-white dark:bg-gray-900 shadow-sm", children: [_jsxs("div", { className: "flex items-center gap-2 text-purple-600 dark:text-purple-400 font-medium text-sm", children: [_jsx(Sparkles, { size: 16 }), " ", "AI Writing Assistant"] }), _jsx("textarea", { value: prompt, onChange: (e) => setPrompt(e.target.value), placeholder: "What should I write about? Or select an action below...", className: "w-full bg-transparent focus:outline-none resize-none text-gray-900 dark:text-gray-100 min-h-[80px]", disabled: isLoading }), _jsxs("div", { className: "flex flex-col gap-2", children: [_jsx(AIPanel, { onAction: handleAIAction, isLoading: isLoading }), _jsx("div", { className: "flex justify-end", children: _jsxs("button", { onClick: () => handleAIAction('generate'), disabled: isLoading || !prompt, className: "flex items-center gap-2 px-4 py-1.5 bg-purple-600 hover:bg-purple-700 disabled:bg-purple-300 text-white rounded-lg text-sm transition-colors", children: [isLoading ? _jsx(Loader2, { size: 14, className: "animate-spin" }) : _jsx(Send, { size: 14 }), "Ask AI"] }) })] })] }));
};
