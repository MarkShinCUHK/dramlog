import type { LayoutServerLoad } from './$types';
import { getUser } from '$lib/server/supabase/auth';

export const load: LayoutServerLoad = async ({ cookies }) => {
  const user = await getUser(cookies);
  // 익명 사용자는 null로 반환 (헤더에서 "내 글" 등이 보이지 않도록)
  return { user: user && !user.isAnonymous ? user : null };
};

