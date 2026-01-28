import { fail, redirect, isRedirect } from '@sveltejs/kit';
import { createSupabaseClient, createSupabaseAuthClient } from '$lib/server/supabase/client';
import { setSessionCookies } from '$lib/server/supabase/auth';

const OAUTH_NEXT_COOKIE = 'oauth-next';

function oauthCookieOptions() {
  return {
    path: '/',
    httpOnly: true,
    sameSite: 'lax' as const,
    secure: process.env.NODE_ENV === 'production',
    maxAge: 60 * 10 // 10분
  };
}

export const actions = {
  google: async ({ url, cookies }) => {
    try {
      const supabase = createSupabaseAuthClient(cookies);
      const next = url.searchParams.get('next') || '/my-posts';
      const safeNext = next.startsWith('/') ? next : '/my-posts';
      const redirectTo = `${url.origin}/auth/callback`;

      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: { redirectTo }
      });

      if (error) {
        if (process.env.NODE_ENV !== 'production') {
          console.error('Google OAuth start failed:', error);
        }
        return fail(400, {
          error: `구글 로그인에 실패했습니다: ${error.message || '알 수 없는 오류'}`
        });
      }

      if (!data?.url) {
        if (process.env.NODE_ENV !== 'production') {
          console.error('Google OAuth URL missing:', data);
        }
        return fail(400, {
          error:
            '구글 OAuth URL이 생성되지 않았습니다. Supabase에서 Google Provider 활성화 및 Redirect URL 설정을 확인해주세요.'
        });
      }

      cookies.set(OAUTH_NEXT_COOKIE, safeNext, oauthCookieOptions());
      throw redirect(303, data.url);
    } catch (error) {
      if (isRedirect(error)) throw error;
      if (process.env.NODE_ENV !== 'production') {
        console.error('Google OAuth unexpected error:', error);
      }
      return fail(400, {
        error: error instanceof Error ? error.message : '구글 로그인에 실패했습니다.'
      });
    }
  },
  login: async ({ request, cookies }) => {
    const formData = await request.formData();
    const email = formData.get('email')?.toString().trim();
    const password = formData.get('password')?.toString();

    if (!email || !password) {
      return fail(400, {
        error: '이메일과 비밀번호를 입력해주세요.',
        values: { email: email || '' }
      });
    }

    const supabase = createSupabaseClient();
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });

    if (error) {
      // Supabase 에러 메시지를 더 구체적으로 표시
      let errorMessage = '로그인에 실패했습니다.';
      if (error.message.includes('Invalid login credentials')) {
        errorMessage = '이메일 또는 비밀번호가 올바르지 않습니다.';
      } else if (error.message.includes('Email not confirmed')) {
        errorMessage = '이메일 인증이 필요합니다.';
      } else {
        errorMessage = error.message || '로그인에 실패했습니다.';
      }
      
      // enhance가 'failure'로 처리하도록 4xx 중에서도 400으로 통일
      return fail(400, {
        error: errorMessage,
        values: { email }
      });
    }

    if (!data.session) {
      return fail(400, {
        error: '로그인에 실패했습니다. 세션을 생성할 수 없습니다.',
        values: { email }
      });
    }

    setSessionCookies(cookies, {
      accessToken: data.session.access_token,
      refreshToken: data.session.refresh_token
    });

    throw redirect(303, '/my-posts');
  }
};
