import { fail } from '@sveltejs/kit';
import { requireAuth, getSession } from '$lib/server/supabase/auth';
import { getProfile, upsertProfile } from '$lib/server/supabase/queries/profiles';
import { createSupabaseClientWithSession } from '$lib/server/supabase/client';

export async function load({ cookies }) {
  const user = await requireAuth(cookies);
  const sessionTokens = getSession(cookies);
  const profile = await getProfile(user.id, sessionTokens || undefined);

  return {
    user,
    profile
  };
}

export const actions = {
  update: async ({ request, cookies }) => {
    const user = await requireAuth(cookies);
    const sessionTokens = getSession(cookies);
    if (!sessionTokens) {
      return fail(401, { error: '로그인 세션이 없습니다.' });
    }

    const formData = await request.formData();
    const nickname = formData.get('nickname')?.toString().trim() || '';
    const bio = formData.get('bio')?.toString().trim() || '';
    const avatarUrl = formData.get('avatarUrl')?.toString().trim() || '';

    if (nickname.length < 2 || nickname.length > 20) {
      return fail(400, {
        error: '닉네임은 2~20자로 입력해주세요.',
        values: { nickname, bio, avatarUrl }
      });
    }

    const supabase = createSupabaseClientWithSession(sessionTokens);
    const { error: authError } = await supabase.auth.updateUser({
      data: {
        nickname
      }
    });
    if (authError) {
      return fail(400, {
        error: authError.message || '프로필 저장에 실패했습니다.',
        values: { nickname, bio, avatarUrl }
      });
    }

    const profile = await upsertProfile(
      user.id,
      {
        nickname,
        bio: bio || undefined,
        avatarUrl: avatarUrl || undefined
      },
      sessionTokens
    );

    if (!profile) {
      return fail(500, {
        error: '프로필 저장 중 오류가 발생했습니다.',
        values: { nickname, bio, avatarUrl }
      });
    }

    return {
      success: true
    };
  }
};
