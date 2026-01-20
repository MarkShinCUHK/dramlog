<script>
  export let post;
</script>

<article class="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow border border-gray-100">
  <h2 class="text-xl font-bold text-gray-900 mb-2">
    <a href="/posts/{post.id}" class="hover:text-whiskey-600 transition-colors">
      {post.title}
    </a>
  </h2>
  {#if post.excerpt}
    <p class="text-gray-600 mb-4 line-clamp-2">{post.excerpt}</p>
  {/if}
  <div class="flex items-center justify-between text-sm text-gray-500">
    <div class="flex items-center gap-4">
      <span class="font-medium">{post.author}</span>
      <span>{post.createdAt}</span>
    </div>
    <div class="flex items-center gap-4">
      {#if post.views !== undefined}
        <span>조회 {post.views}</span>
      {/if}
      {#if post.likes !== undefined}
        <span>좋아요 {post.likes}</span>
      {/if}
    </div>
  </div>
</article>
