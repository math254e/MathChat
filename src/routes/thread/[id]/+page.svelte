<script lang="ts">
  import InputBar from '$lib/components/InputBar.svelte';
  import { page } from '$app/state';
  import { useQuery, useConvexClient } from 'convex-svelte';
  import { useAuth } from '@mmailaender/convex-auth-svelte/sveltekit';
  import { api } from '../../../convex/_generated/api.js';
  import type { PageData } from './$types';
  import { replaceState } from '$app/navigation';

  const { data } = $props<{ data: PageData }>();
  const authToken = useAuth().token;
  const client = useConvexClient();

  let tempMessage = $state<string | null>(null);
  let isLoading = $state(false);
  let error = $state<string | null>(null);
  let selectedModel = "gpt-4.1-nano";
  let thread = $state(useQuery(api.thread.get, { thread_id: page.params.id as any }, { initialData: data.thread }));
  let messages = $derived(thread.data?.messages || []);

  $effect(() => {
    //needed to update the page then going from thread to thread
    thread = useQuery(api.thread.get, { thread_id: page.params.id as any }, { initialData: data.thread });

    //get the initial message from the url
    const url = new URL(window.location.href);
    const initialMessage = url.searchParams.get('message');
    if (initialMessage) {
      sendMessage(initialMessage);
      url.searchParams.delete('message');
      replaceState(url.toString(), {});
    }
  });
  
  async function sendMessage(message: string) {
    try {
      isLoading = true;
      error = null;

      // Add temporary user message
      tempMessage = message;

      //send to server and get response
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message,
          threadId: page.params.id,
          model: selectedModel
        })
      });

      const data = await response.json();

      if (!data.success) {
        throw new Error(data.error || 'Failed to get response');
      }

      // Add both messages to the thread using Convex mutation
      await client.mutation(api.thread.add_message, {
        thread_id: page.params.id as any,
        message: {
          role: 'user',
          content: message
        }
      });

      await client.mutation(api.thread.add_message, {
        thread_id: page.params.id as any,
        message: {
          role: 'assistant',
          content: data.response
        }
      });

      // Clear temporary message
      tempMessage = null;
      isLoading = false;

    } catch (err) {
      console.error('Error in sendMessage:', err);
      error = err instanceof Error ? err.message : 'An unexpected error occurred';
      // Clear the temporary message on error
      tempMessage = null;
      isLoading = false;
    }
  }

</script>


<div class="max-w-3xl mx-auto h-[calc(100vh-4rem)] flex flex-col bg-transparent text-base-content"> 
  {#if error}
    <div class="p-4 bg-error/10 text-error border-b border-error">
      {error}
    </div>
  {/if}
  
  <div class="flex-1 overflow-y-auto p-4 flex flex-col gap-4">
    {#each messages as message}
      {#if message.role === 'user'}
        <div class="flex justify-end">
          <div class="bg-primary text-primary-content px-4 py-3 rounded-2xl max-w-[70%] shadow-md">
            {message.content}
          </div>
        </div>
      {:else}
        <div class="relative group">
          <div class="bg-base-200 p-4 rounded-lg whitespace-pre-wrap shadow-sm text-base-content">
            {message.content}
          </div>
          <!--<button 
            class="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity btn btn-sm btn-ghost"
            disabled={isLoading}
          >
            Split
          </button>-->
        </div>
      {/if}
    {/each}
      
    {#if tempMessage}
      <div class="flex justify-end">
        <div class="bg-primary text-primary-content px-4 py-3 rounded-2xl max-w-[70%] opacity-50 shadow-md">
          {tempMessage}
        </div>
      </div>
    {/if}
  </div>
  
  <div class="p-4 border-t border-base-300 bg-base-100">
    <InputBar onMessage={sendMessage} disable={isLoading}/>
  </div>
</div> 