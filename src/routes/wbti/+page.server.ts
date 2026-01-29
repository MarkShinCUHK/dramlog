import { fail } from '@sveltejs/kit';
import { requireAuth, getSession } from '$lib/server/supabase/auth';
import { upsertProfile } from '$lib/server/supabase/queries/profiles';

const WBTI_CODE_PATTERN = /^[FEX][CIX][SNX][HPX]$/;

export const actions = {
  setWbti: async ({ request, cookies }) => {
    const user = await requireAuth(cookies);
    const sessionTokens = getSession(cookies);
    if (!sessionTokens) {
      return fail(401, { error: '로그인 세션이 없습니다.' });
    }

    const formData = await request.formData();
    const wbtiCode = formData.get('wbtiCode')?.toString().trim().toUpperCase() || '';

    if (!WBTI_CODE_PATTERN.test(wbtiCode)) {
      return fail(400, {
        error: 'WBTI 코드가 올바르지 않습니다.'
      });
    }

    const profile = await upsertProfile(
      user.id,
      {
        wbtiCode
      },
      sessionTokens
    );

    if (!profile) {
      return fail(500, { error: 'WBTI 저장에 실패했습니다.' });
    }

    return {
      wbtiSaved: true
    };
  }
};
