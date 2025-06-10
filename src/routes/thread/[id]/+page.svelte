<script lang="ts">
    import InputBar from '$lib/components/InputBar.svelte';
    import { page } from '$app/state';
    import type { PageData } from './$types';
    import { useQuery, useConvexClient } from 'convex-svelte';
    import { api } from '../../../convex/_generated/api.js';

    const { data } = $props<{ data: PageData }>();

    const client = useConvexClient();

    let thread = useQuery(api.thread.get, { thread_id: page.params.id as any }, { });

    let messages = $state(data.messages || []);
    let tempMessage = $state<string | null>(null);
    let isLoading = $state(false);
    let error = $state<string | null>(null);
    let selectedModel = $state(data.selectedModel);

  
    $effect(() => {
      if (thread.isLoading) {
        return;
      }

      if (thread.error) {
        error = thread.error.toString();
        return;
      }


      //get the initial message from the url
      const url = new URL(window.location.href);
      const initialMessage = url.searchParams.get('message');
      if (initialMessage) {
        sendMessage(initialMessage);
        url.searchParams.delete('message');
        window.history.replaceState({}, '', url.toString());
      }
    });
  
    async function sendMessage(message: string) {
      try {
        isLoading = true;
        error = null;
  
        // Add temporary user message
        tempMessage = message;
  
        // Update thread list to keep it at the top
        //updateThread(thread);
        
        // Send message to API without blocking
        fetch(`/py-api/thread/${page.params.id}/chat`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            message: message,
            model: selectedModel
          })
        })
        .then(async (response) => {
          if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.detail || 'Failed to send message');
          }
          
          const thread = await response.json();
          // Only add new messages that do not already exist by id
          const existingIds = new Set(messages.map((m: { id: string }) => m.id));
          const newMessages = thread.messages.filter((m: { id: string }) => !existingIds.has(m.id));
          messages = [...messages, ...newMessages];
          // Clear the temporary message
          tempMessage = null;
  
          //updateThread(thread.data);
  
        })
        .catch((err) => {
          console.error('Error sending message:', err);
          error = err instanceof Error ? err.message : 'An unexpected error occurred';
          // Clear the temporary message on error
          tempMessage = null;
        })
        .finally(() => {
          isLoading = false;
        });
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
            <button 
              class="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity btn btn-sm btn-ghost"

              disabled={isLoading}
            >
              Split
            </button>
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