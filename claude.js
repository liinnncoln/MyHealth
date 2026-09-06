import Constants from 'expo-constants';

const { ANTHROPIC_API_KEY } = Constants.expoConfig?.extra ?? {};

export const isClaudeConfigured = Boolean(ANTHROPIC_API_KEY);

// IMPORTANT (read this before you ship, not just before you demo):
// This calls the Anthropic API directly from the phone using a key bundled
// into the app. That is fine for a Monday demo on your own device, but it
// means anyone who inspects the app binary can extract your API key.
// Before a real release, move this call behind a tiny backend (a Supabase
// Edge Function is the easiest fit here) that holds the key server-side and
// the app calls instead. The function signature below is written so that
// swap is a one-file change later.

const SYSTEM_PROMPT = `You are "MyHealth AI", a friendly, careful health-information assistant inside the MyHealth app.
Your job: help the user understand their own stored health records, medications, and general health questions in plain language.
Rules:
- You are not a doctor. Never diagnose, never prescribe, never tell someone to stop or start a medication.
- If symptoms sound urgent or severe, clearly advise the user to seek in-person or emergency medical care.
- Keep answers short, warm, and plain-language. Avoid dense medical jargon; explain any term you must use.
- If asked about a specific record, medication, or reading the user mentions, reason from what they tell you in the chat — you do not have direct database access.
- Always make clear that your output is informational, not a clinical diagnosis.`;

export async function sendChatMessage(messages) {
  if (!ANTHROPIC_API_KEY) {
    throw new Error(
      'No Claude API key configured. Add ANTHROPIC_API_KEY to your .env file (see README.md).'
    );
  }

  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': ANTHROPIC_API_KEY,
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify({
      model: 'claude-sonnet-4-6',
      max_tokens: 700,
      system: SYSTEM_PROMPT,
      messages: messages.map((m) => ({ role: m.role, content: m.content })),
    }),
  });

  if (!response.ok) {
    const errText = await response.text();
    throw new Error(`Claude API error (${response.status}): ${errText}`);
  }

  const data = await response.json();
  const textBlock = data.content?.find((c) => c.type === 'text');
  return textBlock?.text ?? "Sorry, I didn't get a response — please try again.";
}
