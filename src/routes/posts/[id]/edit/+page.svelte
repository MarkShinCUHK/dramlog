<script>
  import { enhance } from '$app/forms';
  
  export let data;
  export let form;
  
  let title = form?.values?.title || data.post?.title || '';
  let content = form?.values?.content || data.post?.content || '';
  let author = form?.values?.author || data.post?.author || '';
  let error = form?.error || '';
</script>

<svelte:head>
  <title>글 수정 - {data.post?.title || 'DramLog'}</title>
</svelte:head>

<div class="max-w-4xl mx-auto px-4 py-8">
  <h1 class="text-4xl font-bold text-whiskey-900 mb-8">글 수정</h1>

  <form method="POST" use:enhance class="bg-white rounded-lg shadow-md p-8 border border-gray-100">
    <!-- 에러 메시지 -->
    {#if error}
      <div class="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
        {error}
      </div>
    {/if}

    <!-- 작성자 -->
    <div class="mb-6">
      <label for="author" class="block text-sm font-medium text-gray-700 mb-2">
        작성자
      </label>
      <input
        type="text"
        id="author"
        name="author"
        bind:value={author}
        placeholder="작성자 이름을 입력하세요"
        class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-whiskey-500 focus:border-whiskey-500 outline-none"
        required
      />
    </div>

    <!-- 제목 -->
    <div class="mb-6">
      <label for="title" class="block text-sm font-medium text-gray-700 mb-2">
        제목
      </label>
      <input
        type="text"
        id="title"
        name="title"
        bind:value={title}
        placeholder="게시글 제목을 입력하세요"
        class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-whiskey-500 focus:border-whiskey-500 outline-none"
        required
      />
    </div>

    <!-- 내용 -->
    <div class="mb-6">
      <label for="content" class="block text-sm font-medium text-gray-700 mb-2">
        내용
      </label>
      <textarea
        id="content"
        name="content"
        bind:value={content}
        rows="15"
        placeholder="게시글 내용을 입력하세요"
        class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-whiskey-500 focus:border-whiskey-500 outline-none resize-none"
        required
      ></textarea>
    </div>

    <!-- 버튼 -->
    <div class="flex gap-4 justify-end">
      <a
        href="/posts/{data.post?.id}"
        class="px-6 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors font-medium"
      >
        취소
      </a>
      <button
        type="submit"
        class="px-6 py-3 bg-whiskey-600 text-white rounded-lg hover:bg-whiskey-700 transition-colors font-medium"
      >
        수정하기
      </button>
    </div>
  </form>
</div>
