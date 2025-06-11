import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import OpenAI from 'openai';
import { OPENAI_API_KEY } from '$env/static/private';

const openai = new OpenAI({
  apiKey: OPENAI_API_KEY
});

export const POST: RequestHandler = async ({ request }) => {
  try {
    const { message, threadId, model } = await request.json();

    const completion = await openai.chat.completions.create({
      model: model || 'gpt-4',
      messages: [
        {
          role: 'user',
          content: message
        }
      ]
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