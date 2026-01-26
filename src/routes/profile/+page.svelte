<script lang="ts">
  let { data, form } = $props();

  type FormState = {
    error?: string;
    success?: boolean;
    values?: {
      nickname?: string;
      bio?: string;
      avatarUrl?: string;
    };
  };

  let nickname = $state('');
  let bio = $state('');
  let avatarUrl = $state('');
  let error = $state('');
  let success = $state(false);

  $effect(() => {
    nickname = data.profile?.nickname || data.user?.nickname || '';
    bio = data.profile?.bio || '';
    avatarUrl = data.profile?.avatarUrl || '';

    const formState = form as FormState | undefined;
    if (formState?.values?.nickname !== undefined) nickname = formState.values.nickname || '';
    if (formState?.values?.bio !== undefined) bio = formState.values.bio || '';
    if (formState?.values?.avatarUrl !== undefined) avatarUrl = formState.values.avatarUrl || '';
    if (formState?.error !== undefined) error = formState.error || '';
    if (formState?.success) success = true;
  });
</script>

<svelte:head>
  <title>프로필 - whiskylog</title>
</svelte:head>

<div class="max-w-2xl mx-auto px-4 py-12">
  <h1 class="text-3xl sm:text-4xl font-bold text-whiskey-900 mb-10 tracking-tight">프로필</h1>

  <form
    method="POST"
    action="?/update"
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
        {#if avatarUrl}
          <img src={avatarUrl} alt="프로필 이미지" class="h-full w-full object-cover" />
        {/if}
      </div>
      <div class="flex-1">
        <label for="avatarUrl" class="block text-sm font-medium text-gray-700 mb-2">
          프로필 이미지 URL
        </label>
        <input
          id="avatarUrl"
          name="avatarUrl"
          type="url"
          bind:value={avatarUrl}
          placeholder="https://..."
          class="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-whiskey-500 focus:border-whiskey-500 outline-none transition-colors"
        />
      </div>
    </div>

    <div class="mb-6">
      <label for="nickname" class="block text-sm font-medium text-gray-700 mb-2">
        닉네임
      </label>
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
      <p class="mt-2 text-sm text-gray-500">닉네임은 게시글 작성자명에 반영됩니다.</p>
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
