<script lang="ts">
  import { enhance } from '$app/forms';
  import { page } from '$app/stores';
  import type { Comment } from '$lib/server/supabase/types';
  
  let { 
    comment,
    ondeleted,
    onupdated
  }: {
    comment: Comment;
    ondeleted?: (id: string) => void;
    onupdated?: (comment: Comment) => void;
  } = $props();
  
  let isMyComment = $derived($page.data?.user?.id === comment.userId);
  let authorDisplay = $derived(
    comment.authorName || comment.authorEmail || 
    (isMyComment ? ($page.data?.user?.nickname || $page.data?.user?.email?.split('@')[0] || '나') : '사용자')
  );

  let pendingDelete = $state(false);
  let pendingUpdate = $state(false);
  let isEditing = $state(false);
  let draftContent = $state('');

  $effect(() => {
    if (!isEditing) {
      draftContent = comment.content;
    }
  });

  function enhanceDeleteComment() {
    pendingDelete = true;
    return async ({ result }: { result: any }) => {
      pendingDelete = false;
      if (result.type === 'success') {
        const id = result.data?.deletedId || comment.id;
        ondeleted?.(id);
        return;
      }
    };
  }

  function enhanceUpdateComment() {
    pendingUpdate = true;
    const prev = comment.content;

    return async ({ result }: { result: any }) => {
      pendingUpdate = false;
      if (result.type === 'success') {
        const updated = result.data?.comment;
        if (updated) {
          onupdated?.(updated);
        }
        isEditing = false;
        return;
      }
      draftContent = prev;
    };
  }
</script>

<div class="rounded-xl bg-white/60 backdrop-blur-sm p-5 ring-1 ring-black/5 shadow-sm">
  <div class="flex items-start justify-between mb-3">
    <div class="flex items-center gap-3">
      <span class="font-semibold text-gray-900">
        {authorDisplay}
      </span>
      <span class="text-sm text-gray-500">{comment.createdAt}</span>
      {#if comment.updatedAt !== comment.createdAt}
        <span class="text-xs text-gray-400">(수정됨)</span>
      {/if}
    </div>
    {#if isMyComment}
      <div class="flex items-center gap-3">
        <button
          type="button"
          class="text-xs text-gray-500 hover:text-gray-700 transition-colors"
          onclick={() => (isEditing = true)}
          disabled={pendingUpdate}
        >
          수정
        </button>
        <form method="POST" action="?/deleteComment" use:enhance={enhanceDeleteComment}>
          <input type="hidden" name="commentId" value={comment.id} />
          <button
            type="submit"
            class="text-xs text-red-500 hover:text-red-700 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
            disabled={pendingDelete}
          >
            삭제
          </button>
        </form>
      </div>
    {/if}
  </div>
  {#if isEditing}
    <form method="POST" action="?/updateComment" use:enhance={enhanceUpdateComment} class="space-y-3">
      <input type="hidden" name="commentId" value={comment.id} />
      <textarea
        name="content"
        rows="3"
        bind:value={draftContent}
        class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-whiskey-500 focus:border-whiskey-500 outline-none transition-colors"
        required
        disabled={pendingUpdate}
      ></textarea>
      <div class="flex gap-2">
        <button
          type="submit"
          class="text-xs text-whiskey-700 hover:text-whiskey-900 transition-colors disabled:opacity-60"
          disabled={pendingUpdate}
        >
          저장
        </button>
        <button
          type="button"
          class="text-xs text-gray-500 hover:text-gray-700 transition-colors"
          onclick={() => {
            isEditing = false;
            draftContent = comment.content;
          }}
        >
          취소
        </button>
      </div>
    </form>
  {:else}
    <p class="text-gray-700 whitespace-pre-line leading-relaxed">{comment.content}</p>
  {/if}
</div>
