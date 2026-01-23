/**
 * Thin client wrapper around Firebase Functions.
 *
 * `processAIAction` is intentionally NOT implemented on the client. We call a
 * trusted backend so we can:
 * - keep API keys off the browser
 * - add rate limiting / abuse protection
 * - centralize prompt templates and logging
 *
 * See `functions/src/index.ts` for the actual implementation.
 */
import { getFunctions, httpsCallable } from 'firebase/functions';

/**
 * Calls the `processAIAction` callable function.
 *
 * `data` is kept flexible because the backend supports multiple action types
 * (summarize/translate/etc). If this API stabilizes, we should replace `any`
 * with a proper union type that matches the backend contract.
 */
export const processAIAction = async (data: any) => {
  const functions = getFunctions();
  const callAction = httpsCallable(functions, 'processAIAction');

  // Payload is wrapped to keep room for future metadata (client version, locale...).
  return callAction({ data });
};

/* On the Firebase Backend (Node.js), you would implement:
  - Integration with @google/generative-ai
  - Prompt construction for 'summarize', 'translate', etc.
  - Rate limiting using a counter in Firestore for each user.

  Tip: keep the backend response minimal and explicit (e.g. { text, tokensUsed })
  so the UI doesn't have to guess how to render failures.
*/