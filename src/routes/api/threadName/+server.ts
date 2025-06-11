import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import OpenAI from 'openai';
import { OPENAI_API_KEY } from '$env/static/private';

const openai = new OpenAI({
  apiKey: OPENAI_API_KEY
});

export const POST: RequestHandler = async ({ request }) => {
  try {
    const { userMessage, aiResponse } = await request.json();

    const completion = await openai.chat.completions.create({
      model: 'gpt-4.1-nano',
      messages: [
        {
          role: 'user',
          content: `Based on this conversation, generate a short, descriptive name (max 5 words) for the thread.
          Focus on the main topic or purpose of the conversation.
          If one or two words stand out, make sure to start with them.

          User: ${userMessage}
          Assistant: ${aiResponse}

          Thread name:`
        }
      ]
    });

    const threadName = completion.choices[0]?.message?.content?.trim();

    if (!threadName) {
      throw new Error('Failed to generate thread name');
    }

    return json({
      success: true,
      name: threadName
    });
  } catch (error) {
    console.error('Error generating thread name:', error);
    return json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'An unexpected error occurred'
      },
      { status: 500 }
    );
  }
};

