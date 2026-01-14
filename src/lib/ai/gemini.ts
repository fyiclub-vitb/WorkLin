import { httpsCallable } from 'firebase/functions';
import { functions } from '../firebase/config';

export type AITaskType = 'summarize' | 'translate' | 'improve' | 'generate' | 'tone';

interface AIRequest {
  prompt: string;
  task: AITaskType;
  context?: string;
  targetLanguage?: string;
  tone?: 'professional' | 'casual' | 'academic';
}

export const callGeminiAI = async (data: AIRequest) => {
  try {
    // Calling a Cloud Function to keep API keys secure on the backend
    const aiFunction = httpsCallable<{ data: AIRequest }, { text: string }>(functions, 'processAIAction');
    const result = await aiFunction({ data });
    return result.data.text;
  } catch (error) {
    console.error("AI Error:", error);
    throw new Error("Failed to process AI request. Please check your connection or rate limits.");
  }
};

/**
 * Clean logic inspired by MindTrace to handle markdown block stripping
 */
export const cleanAIResponse = (content: string): string => {
  return content.replace(/```(json|markdown|text)?/g, '').replace(/```/g, '').trim();
};