<script>
  import PostCard from '$lib/components/PostCard.svelte';
  import Pagination from '$lib/components/Pagination.svelte';
  import { page } from '$app/stores';
  
  export let data;

  function hrefForPage(p) {
    const url = new URL($page.url);
    url.searchParams.set('page', p.toString());
    return url.pathname + url.search;
  }
</script>

<svelte:head>
  <title>내 글 - DramLog</title>
</svelte:head>

<div class="max-w-6xl mx-auto px-4 py-12">
  <div class="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-12">
    <div>
      <h1 class="text-4xl sm:text-5xl font-bold text-whiskey-900 mb-3 tracking-tight">내 글</h1>
      <p class="text-lg text-gray-600">
        {#if data.user?.email}
          {data.user.email} 님이 작성한 게시글 목록입니다.
        {:else}
          내가 작성한 게시글 목록입니다.
        {/if}
      </p>
    </div>
    <a
      href="/write"
      class="inline-flex items-center justify-center px-6 py-3 bg-whiskey-600 hover:bg-whiskey-700 text-white rounded-lg transition-colors font-medium shadow-sm hover:shadow-md"
    >
      작성하기
    </a>
  </div>

  {#if !data.posts || data.posts.length === 0}
    <div class="rounded-2xl bg-white/60 backdrop-blur-sm p-12 text-center ring-1 ring-black/5 shadow-sm">
      <p class="text-lg text-gray-700 mb-6">아직 작성한 게시글이 없습니다.</p>
      <a href="/write" class="inline-flex items-center justify-center px-6 py-3 bg-whiskey-600 text-white rounded-lg hover:bg-whiskey-700 transition-colors font-medium shadow-sm hover:shadow-md">
        첫 글 작성하러 가기
      </a>
    </div>
  {:else}
    <div class="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {#each data.posts as post}
        <PostCard {post} />
      {/each}
    </div>

    {#if data.totalPages > 1}
      <Pagination
        page={data.page}
        totalPages={data.totalPages}
        {hrefForPage}
      />
    {/if}
  {/if}
</div>

