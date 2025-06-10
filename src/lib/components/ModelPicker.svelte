<script lang="ts">
  import { useConvexClient, useQuery } from 'convex-svelte';
  import { api } from '../../convex/_generated/api.js';

  interface Model {
    id: string;
    name: string;
    model_id: string;
    provider: string;
    description?: string;
  }

  let { selectedModel = $bindable(), isLoading, error, models } = $props();

  let popoverOpen = $state(false);
  let buttonRef = $state<HTMLButtonElement | null>(null);
  let popoverRef = $state<HTMLDivElement | null>(null);

  const client = useConvexClient();

  async function selectModel(model_id: string) {
    console.log('selectModel called with id:', model_id);
    selectedModel = model_id;
    popoverOpen = false;
    await client.mutation(api.models.set_user_model, { model_id: model_id });
  }

  function handleClickOutside(event: MouseEvent) {
    if (
      popoverOpen &&
      buttonRef &&
      !buttonRef.contains(event.target as Node) &&
      popoverRef &&
      !popoverRef.contains(event.target as Node)
    ) {
      popoverOpen = false;
    }
  }

  // Only run window-related code in the browser
  $effect(() => {
    if (typeof window !== 'undefined') {
      if (popoverOpen) {
        window.addEventListener('mousedown', handleClickOutside);
      } else {
        window.removeEventListener('mousedown', handleClickOutside);
      }
    }
  });

  let selected = $derived(models.find((m: Model) => m.model_id === selectedModel));
</script>

<div class="relative top-4 w-fit transition-all duration-300 left-6">
  <button
    bind:this={buttonRef}
    class="btn btn-ghost h-10 flex items-center justify-between px-4 rounded-lg  select-none text-base-content disabled:bg-base-300 disabled:text-base-content/60 disabled:cursor-not-allowed"
    onclick={() => { if (!isLoading && models.length > 0) { popoverOpen = !popoverOpen; console.log('Button clicked, popoverOpen:', popoverOpen); } }}
    disabled={isLoading || models.length === 0}
    aria-haspopup="listbox"
    aria-expanded={popoverOpen}
    type="button"
  >
    <span>{selected ? selected.name : 'Select model'}</span>
    <svg class="w-4 h-4 ml-2" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M19 9l-7 7-7-7"/></svg>
  </button>

  {#if popoverOpen}
    <div
      bind:this={popoverRef}
      class="absolute left-0 mt-2 z-10 bg-base-200 border border-base-300 rounded-lg shadow-lg min-w-40 max-w-xl w-fit"
    >
      {#each models as model}
        <button
          class="w-full text-left px-4 py-2 hover:bg-base-300 focus:bg-base-300 rounded-lg text-base-content"
          onclick={() => selectModel(model.model_id)}
          type="button"
        >
          <div class="font-medium">{model.name}</div>
          {#if model.description}
            <div class="text-xs text-base-content/70 truncate">{model.description}</div>
          {/if}
        </button>
      {/each}
      {#if models.length === 0}
        <div class="px-4 py-2 text-base-content/60">No models available</div>
      {/if}
    </div>
  {/if}

  {#if error}
    <div class="text-error text-sm mt-2">{error}</div>
  {/if}
</div> 