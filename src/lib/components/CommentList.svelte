<script lang="ts">
  import CommentItem from './CommentItem.svelte';
  import type { Comment } from '$lib/server/supabase/types';
  
  let { 
    comments = [],
    ondeleted,
    onupdated
  }: {
    comments?: Comment[];
    ondeleted?: (id: string) => void;
    onupdated?: (comment: Comment) => void;
  } = $props();
</script>

<div class="space-y-4">
  {#if comments && comments.length > 0}
    {#each comments as comment}
      <CommentItem
        {comment}
        ondeleted={ondeleted}
        onupdated={onupdated}
      />
    {/each}
  {:else}
    <p class="text-center text-gray-500 py-8">아직 댓글이 없습니다.</p>
  {/if}
</div>
