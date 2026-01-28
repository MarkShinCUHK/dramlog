import { redirect } from '@sveltejs/kit';
import { createSupabaseAuthClient } from '$lib/server/supabase/client';
import { setSessionCookies } from '$lib/server/supabase/auth';
import type { RequestHandler } from './$types';

const OAUTH_NEXT_COOKIE = 'oauth-next';

export const GET: RequestHandler = async ({ url, cookies }) => {
  const code = url.searchParams.get('code');
  const error = url.searchParams.get('error_description') || url.searchParams.get('error');
  const nextFromCookie = cookies.get(OAUTH_NEXT_COOKIE);
  const nextFromQuery = url.searchParams.get('next');
  const next = nextFromCookie || nextFromQuery || '/my-posts';
  const safeNext = next.startsWith('/') ? next : '/my-posts';

  if (error) {
    throw redirect(303, `/login?error=${encodeURIComponent(error)}`);
  }

  if (!code) {
    throw redirect(303, `/login?error=${encodeURIComponent('로그인 인증 코드가 없습니다.')}`);
  }

  const supabase = createSupabaseAuthClient(cookies);
  const { data, error: exchangeError } = await supabase.auth.exchangeCodeForSession(code);

  if (exchangeError || !data.session) {
    if (process.env.NODE_ENV !== 'production') {
      console.error('Google OAuth exchange failed:', exchangeError);
    }
    const message = exchangeError?.message
      ? `구글 로그인에 실패했습니다: ${exchangeError.message}`
      : '구글 로그인에 실패했습니다.';
    throw redirect(303, `/login?error=${encodeURIComponent(message)}`);
  }

  setSessionCookies(cookies, {
    accessToken: data.session.access_token,
    refreshToken: data.session.refresh_token
  });

  cookies.delete(OAUTH_NEXT_COOKIE, { path: '/' });
  throw redirect(303, safeNext);
};
