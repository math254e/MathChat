<script lang="ts">
  import { goto } from '$app/navigation';
  import InputBar from '$lib/components/InputBar.svelte';
  import { useQuery, useConvexClient } from 'convex-svelte';
  import { api } from '../convex/_generated/api.js';
  import { useAuth } from '@mmailaender/convex-auth-svelte/sveltekit';



  const { data } = $props();
  const user = useQuery(api.user.get, {});
  const authToken = useAuth().token;

  const client = useConvexClient();

  let disable_input = $state(false);
  let selectedModel = $state(data.user_model);

  $effect(() => {
    selectedModel = data.user_model;
  });

  async function handleMessage(message: string) {
    try {
      disable_input = true;
      
      console.log('Selected model:', selectedModel?.model_id);
      // Create new thread
      const thread_id = await client.mutation(api.thread.create, {model_id: selectedModel?.model_id ?? ''});
      
      if (!thread_id) throw new Error('Failed to create thread');

      console.log('Created thread:', thread_id);
      
      // Redirect to thread page with message
      await goto(`/thread/${thread_id}?message=${encodeURIComponent(message)}`);
    } catch (error) {
      console.error('Error creating thread:', error);
    } finally {
      disable_input = false;
    }
  }
</script>


<div class="max-w-3xl mx-auto h-[calc(100vh-4rem)] flex flex-col items-center justify-center gap-8 bg-transparent text-base-content">
  <h1 class="text-4xl font-bold">Math Chat</h1>
  <InputBar onMessage={handleMessage} disable={disable_input} />
</div>