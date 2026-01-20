<script>
  import { page } from '$app/stores';
</script>

<div class="min-h-screen flex items-center justify-center bg-gray-50">
  <div class="text-center">
    <h1 class="text-6xl font-bold text-whiskey-900 mb-4">{$page.status || 500}</h1>
    <p class="text-xl text-gray-600 mb-8">{$page.error?.message || '오류가 발생했습니다.'}</p>
    <a
      href="/"
      class="inline-block px-6 py-3 bg-whiskey-600 text-white rounded-lg hover:bg-whiskey-700 transition-colors font-medium"
    >
      홈으로 돌아가기
    </a>
  </div>
</div>
