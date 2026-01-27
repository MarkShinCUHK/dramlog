import type { LayoutServerLoad } from './$types';
import { getSession, getUser } from '$lib/server/supabase/auth';
import { getUnreadNotificationCount } from '$lib/server/supabase/queries/notifications';
import { getProfile } from '$lib/server/supabase/queries/profiles';

export const load: LayoutServerLoad = async ({ cookies }) => {
  const user = await getUser(cookies);
  const session = getSession(cookies);
  let unreadCount = 0;
  let profile = null;
  if (user && !user.isAnonymous && session?.accessToken) {
    const sessionTokens = {
      accessToken: session.accessToken,
      refreshToken: session.refreshToken
    };
    unreadCount = await getUnreadNotificationCount(user.id, sessionTokens);
    profile = await getProfile(user.id, sessionTokens);
  }
  // 익명 사용자는 null로 반환 (헤더에서 "내 글" 등이 보이지 않도록)
  return {
    user: user && !user.isAnonymous ? user : null,
    profile,
    notifications: {
      unreadCount
    }
  };
};
