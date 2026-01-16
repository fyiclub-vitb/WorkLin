import { GoogleGenerativeAI } from '@google/generative-ai';

export type AITaskType = 'summarize' | 'translate' | 'improve' | 'generate' | 'tone';

interface AIRequest {
  prompt: string;
  task: AITaskType;
  context?: string;
  targetLanguage?: string;
  tone?: 'professional' | 'casual' | 'academic';
}

// Rate limiting (client-side, per user session)
const rateLimitMap = new Map<string, { count: number; resetTime: number }>();
const RATE_LIMIT = {
  REQUESTS_PER_MINUTE: 15,
  WINDOW_MS: 60000, // 1 minute
};

function checkRateLimit(): boolean {
  const key = 'gemini-api';
  const now = Date.now();
  const limit = rateLimitMap.get(key);

  if (!limit || now > limit.resetTime) {
    rateLimitMap.set(key, { count: 1, resetTime: now + RATE_LIMIT.WINDOW_MS });
    return true;
  }

  if (limit.count >= RATE_LIMIT.REQUESTS_PER_MINUTE) {
    return false;
  }

  limit.count++;
  return true;
}

export const callGeminiAI = async (data: AIRequest) => {
  // Check rate limit
  if (!checkRateLimit()) {
    throw new Error(`Rate limit exceeded. Maximum ${RATE_LIMIT.REQUESTS_PER_MINUTE} AI requests per minute. Please try again later.`);
  }

  // Get API key from environment
  const apiKey = import.meta.env.VITE_GEMINI_API_KEY;

  if (!apiKey) {
    throw new Error('Gemini API key is not configured. Please set VITE_GEMINI_API_KEY in your .env file.');
  }

  try {
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    // Build the system prompt
    let systemPrompt = "";
    switch (data.task) {
      case 'summarize':
        systemPrompt = "Summarize the following text concisely while keeping the key points:";
        break;
      case 'translate':
        systemPrompt = `Translate the following text accurately into ${data.targetLanguage || 'English'}:`;
        break;
      case 'tone':
        systemPrompt = `Rewrite the following text to have a ${data.tone || 'professional'} tone:`;
        break;
      case 'improve':
        systemPrompt = "Improve the clarity, grammar, and flow of the following text while maintaining its original meaning:";
        break;
      default:
        systemPrompt = "Act as a helpful writing assistant. Respond to the following prompt:";
    }

    const finalPrompt = `${systemPrompt}\n\n"${data.prompt}"\n\nReturn ONLY the revised text.`;

    // Generate content with timeout
    const result = await Promise.race([
      model.generateContent(finalPrompt),
      new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Request timeout')), 30000) // 30 second timeout
      )
    ]) as any;

    const response = await result.response;
    return response.text();
  } catch (error: any) {
    console.error("Gemini API Error:", error);
    
    if (error.message?.includes('timeout')) {
      throw new Error('AI request timed out. Please try again.');
    }
    
    if (error.message?.includes('API key') || error.message?.includes('quota')) {
      throw new Error('AI service is temporarily unavailable. Please check your API key or quota limits.');
    }

    throw new Error(error.message || "Failed to process AI request. Please try again.");
  }
};

/**
 * Clean logic inspired by MindTrace to handle markdown block stripping
 */
export const cleanAIResponse = (content: string): string => {
  return content.replace(/```(json|markdown|text)?/g, '').replace(/```/g, '').trim();
};