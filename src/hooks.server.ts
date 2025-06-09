import { sequence } from '@sveltejs/kit/hooks';
import { createConvexAuthHooks } from '@mmailaender/convex-auth-svelte/sveltekit/server';

// Create auth hooks - convexUrl is automatically detected from environment
const { handleAuth } = createConvexAuthHooks();

// Apply hooks in sequence
export const handle = sequence(
  handleAuth,  // This handles all POST requests to /api/auth automatically
  // Your other custom handlers...
);