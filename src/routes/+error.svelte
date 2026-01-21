<script>
  import { page } from '$app/stores';
  
  $: status = $page.status || 500;
  $: is404 = status === 404;
  $: errorMessage = $page.error?.message || (is404 ? '페이지를 찾을 수 없습니다.' : '오류가 발생했습니다.');
  $: title = is404 ? '페이지를 찾을 수 없습니다' : '오류가 발생했습니다';
</script>

<div class="min-h-screen flex items-center justify-center px-4 py-20">
  <div class="max-w-md w-full text-center">
    <div class="rounded-2xl bg-white/80 backdrop-blur-sm p-12 ring-1 ring-black/5 shadow-sm">
      <div class="mb-6">
        <h1 class="text-6xl sm:text-7xl font-bold text-whiskey-900 mb-4 tracking-tight">
          {status}
        </h1>
        <h2 class="text-2xl sm:text-3xl font-bold text-gray-900 mb-3 tracking-tight">
          {title}
        </h2>
        <p class="text-lg text-gray-600">
          {errorMessage}
        </p>
      </div>
      
      <div class="flex flex-col sm:flex-row gap-3 justify-center">
        <a
          href="/"
          class="inline-flex items-center justify-center px-6 py-3 bg-whiskey-600 text-white rounded-lg hover:bg-whiskey-700 transition-colors font-medium shadow-sm hover:shadow-md"
        >
          홈으로 돌아가기
        </a>
        <button
          type="button"
          on:click={() => window.history.back()}
          class="inline-flex items-center justify-center px-6 py-3 bg-white text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium ring-1 ring-black/10 shadow-sm hover:shadow"
        >
          이전 페이지
        </button>
      </div>
    </div>
  </div>
</div>
