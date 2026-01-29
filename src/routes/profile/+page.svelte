<script lang="ts">
  import { resolve } from '$app/paths';

  let { data, form } = $props();

  type FormState = {
    error?: string;
    success?: boolean;
    nicknameStatus?: 'available' | 'taken' | 'invalid' | 'current';
    nicknameMessage?: string;
    values?: {
      nickname?: string;
      bio?: string;
      avatarUrl?: string;
    };
  };

  let nickname = $state('');
  let bio = $state('');
  let avatarUrl = $state('');
  let avatarPreviewUrl = $state('');
  let avatarFileName = $state('');
  let error = $state('');
  let success = $state(false);
  let nicknameStatus = $state<FormState['nicknameStatus']>(undefined);
  let nicknameMessage = $state('');
  let wbtiCode = $state<string | null>(null);

  $effect(() => {
    nickname = data.profile?.nickname || data.user?.nickname || '';
    bio = data.profile?.bio || '';
    avatarUrl = data.profile?.avatarUrl || '';
    wbtiCode = data.profile?.wbtiCode || null;
    avatarPreviewUrl = avatarUrl;
    avatarFileName = '';

    const formState = form as FormState | undefined;
    if (formState?.values?.nickname !== undefined) nickname = formState.values.nickname || '';
    if (formState?.values?.bio !== undefined) bio = formState.values.bio || '';
    if (formState?.values?.avatarUrl !== undefined) avatarUrl = formState.values.avatarUrl || '';
    avatarPreviewUrl = avatarUrl;
    if (formState?.error !== undefined) error = formState.error || '';
    if (formState?.success) success = true;
    nicknameStatus = formState?.nicknameStatus;
    nicknameMessage = formState?.nicknameMessage || '';
  });

  async function resizeImageToSquare(file: File, size = 256): Promise<File> {
    const url = URL.createObjectURL(file);
    try {
      const img = await new Promise<HTMLImageElement>((resolve, reject) => {
        const image = new Image();
        image.onload = () => resolve(image);
        image.onerror = reject;
        image.src = url;
      });

      const canvas = document.createElement('canvas');
      canvas.width = size;
      canvas.height = size;
      const ctx = canvas.getContext('2d');
      if (!ctx) return file;

      const scale = Math.max(size / img.width, size / img.height);
      const drawWidth = img.width * scale;
      const drawHeight = img.height * scale;
      const dx = (size - drawWidth) / 2;
      const dy = (size - drawHeight) / 2;

      ctx.clearRect(0, 0, size, size);
      ctx.drawImage(img, dx, dy, drawWidth, drawHeight);

      const blob = await new Promise<Blob | null>((resolve) =>
        canvas.toBlob((b) => resolve(b), 'image/webp', 0.9)
      );
      if (!blob) return file;

      return new File([blob], 'avatar.webp', { type: 'image/webp' });
    } finally {
      URL.revokeObjectURL(url);
    }
  }

  async function handleAvatarChange(event: Event) {
    const input = event.currentTarget as HTMLInputElement | null;
    const file = input?.files?.[0];
    if (!file) {
      avatarFileName = '';
      return;
    }

    const resized = await resizeImageToSquare(file, 256);
    avatarFileName = file.name;
    avatarUrl = '';
    avatarPreviewUrl = URL.createObjectURL(resized);

    // 리사이즈된 파일로 교체해서 서버에 작은 파일만 업로드
    const dt = new DataTransfer();
    dt.items.add(resized);
    if (input) input.files = dt.files;
  }

  function clearAvatarFile() {
    avatarFileName = '';
  }
</script>

<svelte:head>
  <title>프로필 - whiskylog</title>
</svelte:head>

<div class="max-w-2xl mx-auto px-4 py-12">
  <h1 class="text-3xl sm:text-4xl font-bold text-whiskey-900 mb-10 tracking-tight">프로필</h1>

  <form
    method="POST"
    action="?/update"
    enctype="multipart/form-data"
    class="rounded-2xl bg-white/80 backdrop-blur-sm p-8 sm:p-10 ring-1 ring-black/5 shadow-sm"
  >
    {#if success}
      <div class="mb-6 p-4 bg-green-50/80 border border-green-200/50 rounded-lg text-green-700 text-sm">
        프로필이 저장되었습니다.
      </div>
    {/if}

    {#if error}
      <div class="mb-6 p-4 bg-red-50/80 border border-red-200/50 rounded-lg text-red-700 text-sm">
        {error}
      </div>
    {/if}

    <div class="mb-6 flex items-center gap-4">
      <div class="h-16 w-16 rounded-full bg-whiskey-100 ring-1 ring-whiskey-200 overflow-hidden">
        {#if avatarPreviewUrl}
          <img src={avatarPreviewUrl} alt="프로필 이미지" class="h-full w-full object-cover" />
        {/if}
      </div>
      <div class="flex-1">
        <label for="avatarUrl" class="block text-sm font-medium text-gray-700 mb-2">
          프로필 이미지 (업로드 또는 URL)
        </label>
        <div class="flex flex-col gap-2">
          <input
            id="avatarFile"
            name="avatarFile"
            type="file"
            accept="image/*"
            onchange={handleAvatarChange}
            class="w-full text-sm text-gray-700 file:mr-3 file:px-4 file:py-2 file:rounded-lg file:border-0 file:bg-whiskey-600 file:text-white hover:file:bg-whiskey-700"
          />
          {#if avatarFileName}
            <div class="flex items-center justify-between gap-2">
              <p class="text-xs text-gray-500">선택됨: {avatarFileName} (256×256 자동 리사이즈)</p>
              <button
                type="button"
                onclick={clearAvatarFile}
                class="text-xs text-gray-600 underline underline-offset-2 hover:text-gray-800"
              >
                업로드 해제
              </button>
            </div>
          {/if}
          <input
            id="avatarUrl"
            name="avatarUrl"
            type="url"
            bind:value={avatarUrl}
            placeholder="https://..."
            disabled={!!avatarFileName}
            class="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-whiskey-500 focus:border-whiskey-500 outline-none transition-colors"
          />
          {#if avatarFileName}
            <p class="text-xs text-gray-500">파일 업로드가 선택되어 URL 입력이 비활성화되었습니다.</p>
          {/if}
        </div>
      </div>
    </div>

    <div class="mb-6">
      <div class="flex items-center justify-between gap-3 mb-2">
        <label for="nickname" class="block text-sm font-medium text-gray-700">
          닉네임
        </label>
        <button
          type="submit"
          formaction="?/checkNickname"
          class="inline-flex items-center justify-center rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-xs font-semibold text-gray-700 hover:border-whiskey-300 hover:text-whiskey-700"
        >
          변경 가능 확인
        </button>
      </div>
      <input
        id="nickname"
        name="nickname"
        type="text"
        bind:value={nickname}
        minlength="2"
        maxlength="20"
        required
        class="w-full px-4 py-3 sm:py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-whiskey-500 focus:border-whiskey-500 outline-none transition-colors"
      />
      {#if nicknameMessage}
        <p
          class="mt-2 text-sm {nicknameStatus === 'available' || nicknameStatus === 'current' ? 'text-green-700' : 'text-red-600'}"
        >
          {nicknameMessage}
        </p>
      {:else}
        <p class="mt-2 text-sm text-gray-500">닉네임은 게시글 작성자명에 반영됩니다.</p>
      {/if}
    </div>

    <div class="mb-6 rounded-2xl bg-white/80 p-5 ring-1 ring-black/5">
      <div class="flex flex-wrap items-center justify-between gap-3">
        <div class="flex items-center gap-2">
          <h3 class="text-sm font-semibold text-gray-700">WBTI</h3>
          <details class="relative group">
            <summary class="list-none cursor-pointer inline-flex h-6 w-6 items-center justify-center rounded-full border border-gray-200 text-xs text-gray-500 hover:text-whiskey-700">
              ?
            </summary>
            <div class="absolute left-0 top-8 z-10 w-72 rounded-xl border border-gray-200 bg-white p-4 text-xs text-gray-600 shadow-lg">
              <p class="font-semibold text-gray-700 mb-2">WBTI 축 설명</p>
              <ul class="space-y-1">
                <li>F/E: 익숙한 선택 ↔ 새로운 탐험</li>
                <li>C/I: 캐주얼 ↔ 몰입</li>
                <li>S/N: 감각 ↔ 서사</li>
                <li>H/P: 공유 ↔ 개인</li>
              </ul>
            </div>
          </details>
        </div>
        <a
          href={resolve('/wbti')}
          class="inline-flex items-center justify-center rounded-lg bg-whiskey-600 px-3 py-1.5 text-xs font-semibold text-white shadow hover:bg-whiskey-700"
        >
          WBTI 테스트
        </a>
      </div>
      <div class="mt-3 text-sm text-gray-700">
        {#if wbtiCode}
          현재 WBTI: <span class="font-semibold text-gray-900">{wbtiCode}</span>
        {:else}
          아직 WBTI가 등록되지 않았습니다.
        {/if}
      </div>
    </div>

    <div class="mb-8">
      <label for="bio" class="block text-sm font-medium text-gray-700 mb-2">
        소개
      </label>
      <textarea
        id="bio"
        name="bio"
        rows="4"
        bind:value={bio}
        placeholder="간단한 자기소개를 입력하세요."
        class="w-full px-4 py-3 sm:py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-whiskey-500 focus:border-whiskey-500 outline-none transition-colors"
      ></textarea>
    </div>

    <div class="flex justify-end">
      <button
        type="submit"
        class="inline-flex items-center justify-center px-6 py-3 min-h-[44px] bg-whiskey-600 text-white rounded-lg hover:bg-whiskey-700 transition-colors font-medium shadow-sm hover:shadow-md"
      >
        저장하기
      </button>
    </div>
  </form>
</div>
