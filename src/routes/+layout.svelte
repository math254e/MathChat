<script lang="ts">
	import '../app.css';
  import { setupConvexAuth } from '@mmailaender/convex-auth-svelte/sveltekit';
  
  // Import data from +layout.server.ts 
  let { children, data } = $props();
  
  // Set up authentication (automatically initializes Convex client)
  setupConvexAuth({ getServerState: () => data.authState });
</script>

{@render children()}
