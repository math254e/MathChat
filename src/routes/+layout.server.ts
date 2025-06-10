import { createConvexAuthHandlers } from '@mmailaender/convex-auth-svelte/sveltekit/server';
import type { LayoutServerLoad } from './$types';
import { api } from '../convex/_generated/api.js';

// Create auth handlers - convexUrl is automatically detected from environment 
const { getAuthState, createConvexHttpClient } = createConvexAuthHandlers();

// Export load function to provide auth state to layout
export const load: LayoutServerLoad = async (event) => {
  const authState = await getAuthState(event);
  
  // Only load threads if authenticated
  let threads = null;
  let models = null;
  let user_model = null;
  if (authState) {
    try {
      const client = await createConvexHttpClient(event);
      threads = await client.query(api.thread.get_all, {});
      models = await client.query(api.models.get, {});
      user_model = await client.query(api.models.get_user_model, {});
    } catch (error) {
      console.error('Error loading threads:', error);
    }
  }

  return { 
    authState,
    threads,
    models,
    user_model
  };
};

