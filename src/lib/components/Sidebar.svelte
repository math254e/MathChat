<script lang="ts">
  import { page } from '$app/state';
  import { useAuth } from '@mmailaender/convex-auth-svelte/sveltekit';
  import { useQuery, useConvexClient } from 'convex-svelte';
  import { api } from '../../convex/_generated/api.js';
  import { goto } from '$app/navigation';

  // Authentication
  const { signIn, signOut } = useAuth();
	const isAuthenticated = $derived(useAuth().isAuthenticated);
  const isAuthenticating = $derived(useAuth().isLoading);
  
  const client = useConvexClient();

  const user = useQuery(api.user.get, {});

  // Define the static navigation items
  const navItems = [
    { href: '/', label: 'Home', icon: '🏠' }
  ] as const;

  let { isOpen = $bindable(true), threads } = $props();
  let error = $state('');


  function delete_thread(threadId: string, event: MouseEvent) {
    event.preventDefault(); // Prevent navigation when clicking delete
    event.stopPropagation(); // Prevent event bubbling
    
    client.mutation(api.thread.delete_thread, { thread_id: threadId as any })
      .then(() => {
        const index = threads.findIndex((thread: { id: string }) => thread.id === threadId);
        if (index !== -1) {
          threads.splice(index, 1);
        }
        
        // If we're on the thread's page, redirect to home
        if (page.url.pathname === `/thread/${threadId}`) {
          goto('/');
        }
      })
      .catch((err: Error) => {
        console.error('Error deleting thread:', err);
        error = 'Failed to delete thread';
      });
  }

</script>

<div class="fixed top-4 left-4 z-50 flex gap-2">
  <button 
    class="btn btn-ghost btn-square"
    onclick={() => isOpen = !isOpen} 
    aria-label={isOpen ? 'Close sidebar' : 'Open sidebar'}
  >
    {isOpen ? '◀' : '▶'}
  </button>
  <a 
    href="/"
    class="btn btn-ghost btn-square"
    aria-label="New thread"
  >
    ➕
  </a>
</div>

<nav class="w-64 h-screen bg-base-200 text-base-content p-4 fixed left-0 top-0 transition-transform duration-300 flex flex-col {!isOpen ? '-translate-x-64' : ''}">
  <div class="pt-15 py-4 border-b border-base-300 mb-4">
    <h2 class="text-2xl font-bold m-0">Math Chat</h2>
    <p class="text-sm text-base-content/60">(Not for actual math) </p>
  </div>
  
  <!-- Fixed navigation items -->
  <ul class="list-none p-0 m-0">
    {#each navItems as item}
      <li class="mb-2">
        <a 
          href={item.href}
          class="btn btn-ghost btn-lg btn-block justify-start font-normal {page.url.pathname === item.href ? 'btn-active' : ''}"
          data-sveltekit-preload-data="hover"
        >
          <span class="text-xl mr-3">{item.icon}</span>
          <span class="text-base">{item.label}</span>
        </a>
      </li>
    {/each}
  </ul>

  <!-- Scrollable threads section -->
  <div class="flex-1 overflow-y-auto mt-4 scrollbar-thin scrollbar-thumb-base-300 scrollbar-track-transparent">
    {#if isAuthenticating}
      <div class="px-4 text-base-content/60 text-sm uppercase tracking-wider mb-2">
        Loading...
      </div>
    {:else if threads && threads.length > 0 && isAuthenticated}
      <div class="px-4 text-base-content/60 text-sm uppercase tracking-wider mb-2">
        Your Threads
      </div>
      <ul class="list-none p-0 m-0">
        {#each threads as thread}
          <li class="mb-2">
            <a
              href="/thread/{thread.id}"
              class="btn btn-ghost btn-lg btn-block text-left font-normal group {page.url.pathname === `/thread/${thread.id}` ? 'btn-active' : ''}"
              data-sveltekit-preload-data="hover">
              <span class="flex items-center w-full">
                <span class="text-base flex-1 truncate">{thread?.name || `Thread ${thread?.id?.slice(0, 8) || ''}`}</span>
              </span>
              <button
                class="opacity-0 text-base-content/60 w-7 h-7 absolute right-7 group-hover:bg-base-300 group-hover:opacity-100 hover:text-error"
                style="pointer-events: auto;"
                onclick={(e) => delete_thread(thread.id, e)}
                aria-label="Delete thread"
              >
                ✕
              </button>
            </a>
          </li>
        {/each}
      </ul>
    {/if}
  </div>

  {#if error}
    <div class="text-error px-4 py-2 text-sm mt-auto bg-error/10 rounded shadow-md">{error}</div>
  {/if}

  <!-- user name and sign in / out -->
  {#if isAuthenticated && !isAuthenticating}
  <div class="flex flex-col items-center justify-center gap-4 pt-4">
    <p class="text-sm text-base-content/60">Signed in as {user.data?.name}</p>
    <button class="btn btn-primary" onclick={() => signOut()}>Sign out</button>
  </div>
  {:else}
  <div class="flex flex-col items-center justify-center gap-4">
    <button class="btn btn-primary" onclick={() => signIn('github')}>Sign in with GitHub</button>
  </div>
  {/if}
</nav> 