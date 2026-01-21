<script>
  // PostCard와 동일한 레이아웃의 스켈레톤
  // 썸네일 + 제목 + 본문 라인 + 작성자/날짜
</script>

<article class="overflow-hidden rounded-2xl bg-white ring-1 ring-black/5 shadow-sm">
  <!-- 썸네일 스켈레톤 -->
  <div class="aspect-[16/10] w-full bg-gradient-to-br from-whiskey-200 to-whiskey-300 animate-pulse"></div>

  <!-- 내용 스켈레톤 -->
  <div class="p-5">
    <!-- 제목 스켈레톤 -->
    <div class="h-6 bg-gray-200 rounded-lg animate-pulse mb-3"></div>
    <div class="h-5 bg-gray-200 rounded-lg animate-pulse mb-2 w-3/4"></div>

    <!-- 본문 라인 스켈레톤 -->
    <div class="space-y-2 mt-4">
      <div class="h-4 bg-gray-200 rounded animate-pulse"></div>
      <div class="h-4 bg-gray-200 rounded animate-pulse w-5/6"></div>
      <div class="h-4 bg-gray-200 rounded animate-pulse w-4/6"></div>
    </div>

    <!-- 하단 메타 스켈레톤 -->
    <div class="mt-4 flex items-center justify-between">
      <div class="flex items-center gap-2">
        <div class="h-7 w-7 rounded-full bg-gray-200 animate-pulse"></div>
        <div class="h-4 w-20 bg-gray-200 rounded animate-pulse"></div>
      </div>
      <div class="h-4 w-16 bg-gray-200 rounded animate-pulse"></div>
    </div>
  </div>
</article>
