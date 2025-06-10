<script lang="ts">
  let { onMessage, disable } = $props<{
    onMessage: (message: string) => void;
    disable: boolean;
  }>();

  let input = $state('');
  let textarea: HTMLTextAreaElement;
  
  function handleKeydown(e: KeyboardEvent) {
    if (e.key === 'Enter' && !e.shiftKey && input.trim()) {
      e.preventDefault();
      sendMessage();
    }
  }

  function autoExpand() {
    textarea.style.height = 'auto';
    const newHeight = Math.min(textarea.scrollHeight, 10 * 24); // 24px per line, max 10 lines
    textarea.style.height = `${newHeight}px`;
  }

  function sendMessage() {
    if (!input.trim()) return;
    
    onMessage(input.trim());
    input = '';
    textarea.style.height = 'auto';
  }
</script>

<div class="flex flex-col w-full gap-4">
  <div class="flex flex-col bg-base-300 rounded-2xl border border-base-300 px-4 py-2 gap-2 w-full">
    <textarea
      bind:this={textarea}
      class="textarea w-full bg-transparent border-none outline-none text-base-content text-base py-3 px-4 placeholder-base-content/60 resize-none min-h-[48px] max-h-[240px] shadow-none focus:outline-none focus:ring-0 focus:border-none"
      placeholder="Ask anything"
      bind:value={input}
      disabled={disable}
      onkeydown={handleKeydown}
      oninput={autoExpand}
      rows="2"
    ></textarea>
    <div class="flex justify-end">
      <button 
        class="btn btn-circle btn-ghost bg-primary text-base-content/60 hover:text-primary transition-colors" 
        aria-label="Send"
        onclick={sendMessage}
      >
        <svg width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
          <path d="M2 21l21-9-21-9v7l15 2-15 2z" />
        </svg>
      </button>
    </div>
  </div>
</div> 