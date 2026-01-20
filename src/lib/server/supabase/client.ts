import { createClient } from '@supabase/supabase-js';
import { PUBLIC_SUPABASE_URL, PUBLIC_SUPABASE_ANON_KEY } from '$env/static/public';

/**
 * Supabase 클라이언트 생성 (서버 전용)
 * 
 * 주의사항:
 * - 이 파일은 서버에서만 사용됩니다 (SvelteKit의 server 디렉토리 규칙)
 * - PUBLIC_ 접두사가 붙은 환경 변수는 클라이언트에 노출되지만,
 *   ANON_KEY는 읽기/쓰기 권한이 RLS로 제어되므로 안전합니다
 * - Service Role Key는 절대 사용하지 마세요 (클라이언트 노출 금지)
 */
if (!PUBLIC_SUPABASE_URL || !PUBLIC_SUPABASE_ANON_KEY) {
  throw new Error(
    'Missing Supabase environment variables. Please set PUBLIC_SUPABASE_URL and PUBLIC_SUPABASE_ANON_KEY in your .env file.'
  );
}

export function createSupabaseClient() {
  return createClient(PUBLIC_SUPABASE_URL, PUBLIC_SUPABASE_ANON_KEY);
}
