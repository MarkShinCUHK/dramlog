import { createSupabaseClientForSession } from '../client.js';
import type { Profile, ProfileRow } from '../types.js';
import type { SessionTokens } from '../auth.js';

const PROFILE_COLUMNS = 'user_id,nickname,bio,avatar_url,wbti_code,updated_at';

function mapRowToProfile(row: ProfileRow): Profile {
  return {
    userId: row.user_id,
    nickname: row.nickname ?? null,
    bio: row.bio ?? null,
    avatarUrl: row.avatar_url ?? null,
    wbtiCode: row.wbti_code ?? null,
    updatedAt: row.updated_at
  };
}

export async function getProfile(userId: string, sessionTokens?: SessionTokens): Promise<Profile | null> {
  try {
    const supabase = createSupabaseClientForSession(sessionTokens);

    const { data, error } = await supabase
      .from('profiles')
      .select(PROFILE_COLUMNS)
      .eq('user_id', userId)
      .single();

    if (error) {
      if (error.code === 'PGRST116') return null;
      console.error('프로필 조회 오류:', error);
      return null;
    }
    if (!data) return null;
    return mapRowToProfile(data);
  } catch (error) {
    console.error('프로필 조회 오류:', error);
    return null;
  }
}

export async function upsertProfile(
  userId: string,
  input: { nickname?: string; bio?: string; avatarUrl?: string; wbtiCode?: string },
  sessionTokens: SessionTokens
): Promise<Profile | null> {
  try {
    const supabase = createSupabaseClientForSession(sessionTokens);
    const payload: {
      user_id: string;
      nickname?: string | null;
      bio?: string | null;
      avatar_url?: string | null;
      wbti_code?: string | null;
      updated_at: string;
    } = {
      user_id: userId,
      updated_at: new Date().toISOString()
    };

    if (input.nickname !== undefined) payload.nickname = input.nickname ?? null;
    if (input.bio !== undefined) payload.bio = input.bio ?? null;
    if (input.avatarUrl !== undefined) payload.avatar_url = input.avatarUrl ?? null;
    if (input.wbtiCode !== undefined) payload.wbti_code = input.wbtiCode ?? null;

    const { data, error } = await supabase
      .from('profiles')
      .upsert(
        payload,
        { onConflict: 'user_id' }
      )
      .select(PROFILE_COLUMNS)
      .single();

    if (error) {
      console.error('프로필 저장 오류:', error);
      return null;
    }
    if (!data) return null;
    return mapRowToProfile(data);
  } catch (error) {
    console.error('프로필 저장 오류:', error);
    return null;
  }
}

export async function isNicknameAvailable(
  nickname: string,
  userId: string,
  sessionTokens: SessionTokens
): Promise<boolean> {
  try {
    const supabase = createSupabaseClientForSession(sessionTokens);
    const { data, error } = await supabase
      .from('profiles')
      .select('user_id')
      .eq('nickname', nickname)
      .neq('user_id', userId)
      .limit(1);

    if (error) {
      console.error('닉네임 중복 확인 오류:', error);
      return false;
    }
    return (data?.length ?? 0) === 0;
  } catch (error) {
    console.error('닉네임 중복 확인 오류:', error);
    return false;
  }
}
