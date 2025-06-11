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

    if (!thread || !thread.messages) {
      throw new Error('Thread not found or has no messages');
    }

    // Format messages for OpenAI API
    const messages: ChatCompletionMessageParam[] = thread.messages.map((msg: { role: string; content: string }) => ({
      role: msg.role as 'user' | 'assistant' | 'system',
      content: msg.content
    }));

    // Add the new user message
    messages.push({
      role: 'user',
      content: message
    });
    
    const completion = await openai.chat.completions.create({
      model: model || 'gpt-4.1-nano',
      messages
    });

    const response = completion.choices[0]?.message?.content;

    if (!response) {
      throw new Error('No response from OpenAI');
    }

    return json({
      success: true,
      response
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

