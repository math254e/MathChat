<script lang="ts">
	import '../app.css';
  import { setupConvexAuth } from '@mmailaender/convex-auth-svelte/sveltekit';
  import Sidebar from '$lib/components/Sidebar.svelte';
  import { useAuth } from '@mmailaender/convex-auth-svelte/sveltekit';
	import { useQuery } from 'convex-svelte';
	import { api } from '../convex/_generated/api.js';
	import ModelPicker from '$lib/components/ModelPicker.svelte';

  // Import data from +layout.server.ts 
  let { children, data } = $props();
	let sidebarOpen = $state(true);
	let isLoading = $state(false);
	let error = $state('');
	let selectedModel = $state(data.user_model?.model_id ?? '');

  // Set up authentication (automatically initializes Convex client)
  setupConvexAuth({ getServerState: () => data.authState });	

  // Authentication
	const { signIn } = useAuth();
	const isAuthenticated = $derived(useAuth().isAuthenticated);
  const isAuthenticating = $derived(useAuth().isLoading);

	// Use server-loaded threads initially, then switch to client updates
	let threadsData = useQuery(api.thread.get_all, {}, { initialData: data.threads ?? undefined });
	let threads = $derived(threadsData?.data);

	let modelsData = useQuery(api.models.get, {}, { initialData: data.models ?? undefined });
	let models = $state(modelsData?.data?.map(m => ({ ...m, id: m.model_id })) ?? []);

</script>

<div class="flex min-h-dvh">
	<Sidebar bind:isOpen={sidebarOpen} threads={threads} />
	<main class="content flex-1 ml-64" class:sidebar-closed={!sidebarOpen}>
		<ModelPicker bind:selectedModel={selectedModel} isLoading={isLoading} error={error} models={models} isOpen={sidebarOpen} />
		{#if isAuthenticated}
			{@render children()}
		{:else}
		<div class="flex flex-col h-full items-center justify-center gap-4">
			<h2 class="text-2xl font-bold">Please sign in to continue</h2>
			<button class="btn btn-primary" onclick={() => signIn('github')}>Sign in with GitHub</button>
		</div>
		{/if}
	</main>
</div>

<style>
	.content {
		transition: margin-left 0.3s ease;
	}

	.content.sidebar-closed {
		margin-left: 0;
	}
</style>
