import type { PageServerLoad } from './$types';
import { api } from '../convex/_generated/api.js';
import { createConvexAuthHandlers } from '@mmailaender/convex-auth-svelte/sveltekit/server';

export const load = (async (event) => {
  const { createConvexHttpClient } = createConvexAuthHandlers();
  
  try {
    // Create an authenticated HTTP client
    // If the user is authenticated, this client will have the auth token
    // If not, it will be an unauthenticated client
    const client = await createConvexHttpClient(event);

    // Make authenticated queries to your Convex backend
    const user = await client.query(api.user.get, {});
    
    return { user };
  } catch (error) {
    console.error('Error loading user data:', error);
    return { user: null };
  }
}) satisfies PageServerLoad;