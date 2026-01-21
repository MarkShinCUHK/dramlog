<script>
  import CommentItem from './CommentItem.svelte';
  import { createEventDispatcher } from 'svelte';
  
  export let comments = [];

  const dispatch = createEventDispatcher();
</script>

<div class="space-y-4">
  {#if comments && comments.length > 0}
    {#each comments as comment}
      <CommentItem
        {comment}
        on:deleted={(e) => dispatch('deleted', e.detail)}
      />
    {/each}
  {:else}
    <p class="text-center text-gray-500 py-8">아직 댓글이 없습니다.</p>
  {/if}
</div>
