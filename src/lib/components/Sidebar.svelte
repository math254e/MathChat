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
  //  { href: '/', label: 'Home', icon: '🏠' }
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

<div class="fixed top-4 left-4 z-50 flex gap-2 w-10 h-10">
  <button 
    class="btn btn-ghost btn-square w-full h-full"
    onclick={() => isOpen = !isOpen} 
    aria-label={isOpen ? 'Close sidebar' : 'Open sidebar'}
  >
    <svg xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 32 32" class="transition-transform duration-300 size-4/5" style="transform: rotate({isOpen ? '0deg' : '180deg'})">
      <path d="M20.697 24L9.303 16.003 20.697 8z"/>
    </svg>
  </button>
  <label class="swap swap-rotate btn btn-ghost btn-square w-full h-full grid place-items-center">
    <input type="checkbox" class="theme-controller" value="dim" />
    <svg class="swap-off fill-current size-11/12" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
      <path d="M5.64,17l-.71.71a1,1,0,0,0,0,1.41,1,1,0,0,0,1.41,0l.71-.71A1,1,0,0,0,5.64,17ZM5,12a1,1,0,0,0-1-1H3a1,1,0,0,0,0,2H4A1,1,0,0,0,5,12Zm7-7a1,1,0,0,0,1-1V3a1,1,0,0,0-2,0V4A1,1,0,0,0,12,5ZM5.64,7.05a1,1,0,0,0,.7.29,1,1,0,0,0,.71-.29,1,1,0,0,0,0-1.41l-.71-.71A1,1,0,0,0,4.93,6.34Zm12,.29a1,1,0,0,0,.7-.29l.71-.71a1,1,0,1,0-1.41-1.41L17,5.64a1,1,0,0,0,0,1.41A1,1,0,0,0,17.66,7.34ZM21,11H20a1,1,0,0,0,0,2h1a1,1,0,0,0,0-2Zm-9,8a1,1,0,0,0-1,1v1a1,1,0,0,0,2,0V20A1,1,0,0,0,12,19ZM18.36,17A1,1,0,0,0,17,18.36l.71.71a1,1,0,0,0,1.41,0,1,1,0,0,0,0-1.41ZM12,6.5A5.5,5.5,0,1,0,17.5,12,5.51,5.51,0,0,0,12,6.5Zm0,9A3.5,3.5,0,1,1,15.5,12,3.5,3.5,0,0,1,12,15.5Z" />
    </svg>
    <svg class="swap-on fill-current size-11/12" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
      <path d="M21.64,13a1,1,0,0,0-1.05-.14,8.05,8.05,0,0,1-3.37.73A8.15,8.15,0,0,1,9.08,5.49a8.59,8.59,0,0,1,.25-2A1,1,0,0,0,8,2.36,10.14,10.14,0,1,0,22,14.05,1,1,0,0,0,21.64,13Zm-9.5,6.69A8.14,8.14,0,0,1,7.08,5.22v.27A10.15,10.15,0,0,0,17.22,15.63a9.79,9.79,0,0,0,2.1-.22A8.11,8.11,0,0,1,12.14,19.73Z" />
    </svg>
  </label>
  <a href="/" class="btn btn-ghost btn-square w-full h-full" aria-label="New thread">
    <svg class="swap-on fill-current rotate-45 size-4/5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">
      <polygon points="400 145.49 366.51 112 256 222.51 145.49 112 112 145.49 222.51 256 112 366.51 145.49 400 256 289.49 366.51 400 400 366.51 289.49 256 400 145.49" />
    </svg>
  </a>
</div>


<nav class="w-64 h-screen bg-base-200 text-base-content p-4 fixed left-0 top-0 transition-transform duration-300 flex flex-col {!isOpen ? '-translate-x-64' : ''}">
  <div class="pt-15 py-4 border-b border-base-300 mb-4">
    <h2 class="text-2xl font-bold m-0">Math Chat</h2>
    <p class="text-sm text-base-content/60">(Not for actual math) </p>
  </div>
  
  <!-- Fixed navigation items -->
  <!--<ul class="list-none p-0 m-0">
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
  </ul>-->

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
                <span class="text-base flex-1 truncate">{thread?.name || 'New Chat'}</span>
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