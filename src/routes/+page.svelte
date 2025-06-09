<script lang="ts">
  import { useAuth } from '@mmailaender/convex-auth-svelte/sveltekit';
	import { api } from '../convex/_generated/api.js';
  import { useQuery, useConvexClient } from 'convex-svelte';

  let { data } = $props();
  const isAuthenticated = $derived(useAuth().isAuthenticated);
  const isLoading = $derived(useAuth().isLoading);
  const { signIn, signOut } = useAuth();


  
</script>

{#if isLoading}
  <p>Loading authentication state...</p>
{:else if isAuthenticated}
  <h1>Welcome, user!</h1>
  <button onclick={() => signOut()}>Sign Out</button>
{:else}
  <h1>Please sign in</h1>
  <button onclick={() => signIn('github')}>
    Sign in with GitHub
  </button>
{/if}