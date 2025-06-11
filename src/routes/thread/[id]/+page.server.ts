import { createConvexAuthHandlers } from '@mmailaender/convex-auth-svelte/sveltekit/server';
import { api } from '../../../convex/_generated/api.js';

// Create auth handlers - convexUrl is automatically detected from environment 
const { getAuthState, createConvexHttpClient } = createConvexAuthHandlers();

// Export load function to provide auth state to layout
export const load = async (event) => {
  const authState = await getAuthState(event);
  
  // Only load threads if authenticated
  let thread = null;
  if (authState) {
    try {
      const client = await createConvexHttpClient(event);
      thread = await client.query(api.thread.get, { thread_id: event.params.id as any });
    } catch (error) {
      console.error('Error loading threads:', error);
    }
  }

  return { 
    thread
  };
};
