<script>
  export let form;

  let email = '';
  let nickname = '';
  let error = '';

  // 서버 액션 응답(form)이 바뀔 때마다 입력값/에러를 갱신
  $: email = form?.values?.email || email;
  $: nickname = form?.values?.nickname || nickname;
  $: error = form?.error || '';
</script>

<svelte:head>
  <title>회원가입 - DramLog</title>
</svelte:head>

<div class="max-w-md mx-auto px-4 py-12">
  <h1 class="text-3xl sm:text-4xl font-bold text-whiskey-900 mb-10 tracking-tight text-center">회원가입</h1>

  <form
    method="POST"
    use:enhance={() => {
      return async ({ result, update }) => {
        try {
          await update();

          if (result && (result.type === 'success' || result.type === 'redirect')) {
            // 익명 사용자였는지 확인 (서버에서 전달된 정보 사용)
            const wasAnonymous = result.data?.wasAnonymous ?? false;
            const convertedCount = result.data?.convertedCount ?? 0;
            const sessionExpired = result.data?.sessionExpired ?? false;

            if (wasAnonymous && convertedCount > 0) {
              showToast(
                `회원가입이 완료되었습니다. 익명으로 작성한 ${convertedCount}개의 글이 본인 글로 옮겨졌습니다.${sessionExpired ? ' (오래된 세션으로 인해 일부 글은 업데이트되지 않았을 수 있습니다. 필요시 다시 로그인해주세요.)' : ''}`,
                'success'
              );
            } else if (wasAnonymous && sessionExpired) {
              showToast(
                '회원가입이 완료되었습니다. 다만 오래된 세션으로 인해 익명으로 작성한 일부 글은 업데이트되지 않았을 수 있습니다. 필요시 다시 로그인해주세요.',
                'success'
              );
            } else {
              showToast('회원가입이 완료되었습니다.', 'success');
            }
          } else if (result && result.type === 'failure' && result.data?.error) {
            showToast(result.data.error, 'error');
          }
        } catch (error) {
          console.error('회원가입 오류:', error);
        }
      };
    }}
    class="rounded-2xl bg-white/80 backdrop-blur-sm p-8 sm:p-10 ring-1 ring-black/5 shadow-sm"
  >
    {#if error}
      <div class="mb-6 p-4 bg-red-50/80 border border-red-200/50 rounded-lg text-red-700 text-sm">
        {error}
      </div>
    {/if}

    <div class="mb-5">
      <label for="email" class="block text-sm font-medium text-gray-700 mb-2">이메일</label>
      <input
        id="email"
        name="email"
        type="email"
        bind:value={email}
        required
        class="w-full px-4 py-3 sm:py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-whiskey-500 focus:border-whiskey-500 outline-none transition-colors"
        placeholder="you@example.com"
      />
    </div>

    <div class="mb-5">
      <label for="nickname" class="block text-sm font-medium text-gray-700 mb-2">닉네임</label>
      <input
        id="nickname"
        name="nickname"
        type="text"
        bind:value={nickname}
        required
        minlength="2"
        maxlength="20"
        class="w-full px-4 py-3 sm:py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-whiskey-500 focus:border-whiskey-500 outline-none transition-colors"
        placeholder="닉네임을 입력하세요"
      />
      <p class="mt-2 text-sm text-gray-500">닉네임은 나중에 프로필로 확장할 수 있어요.</p>
    </div>

    <div class="mb-5">
      <label for="password" class="block text-sm font-medium text-gray-700 mb-2">비밀번호</label>
      <input
        id="password"
        name="password"
        type="password"
        required
        minlength="8"
        class="w-full px-4 py-3 sm:py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-whiskey-500 focus:border-whiskey-500 outline-none transition-colors"
        placeholder="8자 이상"
      />
    </div>

    <div class="mb-8">
      <label for="passwordConfirm" class="block text-sm font-medium text-gray-700 mb-2">비밀번호 확인</label>
      <input
        id="passwordConfirm"
        name="passwordConfirm"
        type="password"
        required
        minlength="8"
        class="w-full px-4 py-3 sm:py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-whiskey-500 focus:border-whiskey-500 outline-none transition-colors"
        placeholder="비밀번호를 다시 입력"
      />
    </div>

    <button
      type="submit"
      class="w-full px-6 py-3 min-h-[44px] bg-whiskey-600 text-white rounded-lg hover:bg-whiskey-700 transition-colors font-medium shadow-sm hover:shadow-md"
    >
      회원가입
    </button>

    <p class="mt-6 text-sm text-gray-600 text-center">
      이미 계정이 있나요?
      <a href="/login" class="text-whiskey-700 hover:text-whiskey-800 font-medium">로그인</a>
    </p>
  </form>
</div>

