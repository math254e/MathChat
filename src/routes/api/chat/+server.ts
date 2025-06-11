import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import OpenAI from 'openai';
import { OPENAI_API_KEY } from '$env/static/private';
import { createConvexAuthHandlers } from '@mmailaender/convex-auth-svelte/sveltekit/server';
import { api } from '../../../convex/_generated/api.js';
import type { ChatCompletionMessageParam } from 'openai/resources/chat/completions';

const openai = new OpenAI({
  apiKey: OPENAI_API_KEY
});

const { createConvexHttpClient } = createConvexAuthHandlers();

export const POST: RequestHandler = async (event) => {
  try {
    const { message, threadId, model } = await event.request.json();

    // Get thread messages from Convex using server-side client
    const convex = await createConvexHttpClient(event);
    const thread = await convex.query(api.thread.get, { thread_id: threadId });
    const user = await convex.query(api.user.get, { });

    if (!thread || !thread.messages) {
      throw new Error('Thread not found or has no messages');
    }

    // Format messages for OpenAI API
    const messages = thread.messages.map((msg: { role: string; content: string }) => ({
      role: msg.role as 'user' | 'assistant' | 'system',
      content: msg.content
    }));

    // Add the new user message
    //messages.push({
    //  role: 'user',
    //  content: message
    //});
    //console.log(messages);

    //System prompt
    const systemPrompt = `
     Assist the user with any inquiry they have, except for math-related problems. 

If a user asks a math question, explain that you cannot assist with that type of inquiry as they were told that you are not a math bot.

You may clarify that "Math Chat" is merely a name associated with the creator and is not related to mathematics.

# Steps

1. Greet the user using their name if it's available.
2. Respond to their inquiry with helpful information, avoiding math-related topics.
3. If a math question is asked, politely inform the user that you cannot assist with math.
4. Optionally clarify that "Math Chat" refers to the creator's name rather than math-related services.

# Output Format

A conversational response tailored to the user's question, respectful and informative while adhering to the constraints of not addressing math-related questions.

# Examples

**Example 1:**
- **User Input:** "Can you help me solve x^2 + 5x + 6 = 0?"
- **Response:** "Did you not understand that I can't assist with math problems? 'Math Chat' is just a name associated with its creator and has no relation to mathematics. How else may I help you?"

**Example 2:**
- **User Input:** "Can you tell me about the weather today?"
- **Response:** "Of course! Let me check the weather for you. Where are you located?"

# Notes

- Always maintain a polite and engaging tone. 
Besides then the user is asking a math question, then you can be as hard and cold as you can.
- Ensure clarity when explaining the purpose behind "Math Chat" if needed.
- Remember the primary constraint: do not engage with math-related problems.
    `;

    const response = await openai.responses.create({
      model: model || 'gpt-4.1-nano',
      instructions: systemPrompt,
      input: messages
    });

    if (!response.output_text) {
      throw new Error('No response from OpenAI');
    }

    return json({
      success: true,
      response_text: response.output_text
    });
  } catch (error) {
    console.error('Error in chat endpoint:', error);
    return json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'An unexpected error occurred'
      },
      { status: 500 }
    );
  }
}; 

