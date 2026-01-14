import { httpsCallable } from 'firebase/functions';
import { functions } from '../firebase/config';
export const callGeminiAI = async (data) => {
    try {
        // Calling a Cloud Function to keep API keys secure on the backend
        const aiFunction = httpsCallable(functions, 'processAIAction');
        const result = await aiFunction({ data });
        return result.data.text;
    }
    catch (error) {
        console.error("AI Error:", error);
        throw new Error("Failed to process AI request. Please check your connection or rate limits.");
    }
};
/**
 * Clean logic inspired by MindTrace to handle markdown block stripping
 */
export const cleanAIResponse = (content) => {
    return content.replace(/```(json|markdown|text)?/g, '').replace(/```/g, '').trim();
};
