import { createSupabaseClient } from '../client.js';
import type { Post, PostRow } from '../types.js';

/**
 * Supabase row를 Post 타입으로 변환
 */
function mapRowToPost(row: PostRow): Post {
  const createdAt = new Date(row.created_at);
  const dateStr = createdAt.toISOString().split('T')[0]; // YYYY-MM-DD

  return {
    id: row.id,
    title: row.title,
    content: row.content,
    author: row.author_name || '익명',
    createdAt: dateStr,
    // 선택적 필드들 안전하게 처리
    likes: row.like_count ?? undefined,
    views: undefined, // 현재 스키마에 없음
  };
}

/**
 * 게시글 목록 조회 (최신순)
 */
export async function listPosts(limit?: number): Promise<Post[]> {
  try {
    const supabase = createSupabaseClient();
    
    let query = supabase
      .from('posts')
      .select('*')
      .order('created_at', { ascending: false });

    if (limit && limit > 0) {
      query = query.limit(limit);
    }

    const { data, error } = await query;

    if (error) {
      console.error('게시글 목록 조회 오류:', error);
      throw error;
    }

    if (!data || data.length === 0) {
      return [];
    }

    return data.map(mapRowToPost);
  } catch (error) {
    console.error('게시글 목록 조회 오류:', error);
    // 에러 발생 시 빈 배열 반환 (UI가 깨지지 않도록)
    return [];
  }
}

/**
 * ID로 게시글 조회
 */
export async function getPostById(id: string): Promise<Post | null> {
  try {
    const supabase = createSupabaseClient();

    const { data, error } = await supabase
      .from('posts')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      // 404 에러는 null 반환
      if (error.code === 'PGRST116') {
        return null;
      }
      console.error('게시글 조회 오류:', error);
      throw error;
    }

    if (!data) {
      return null;
    }

    return mapRowToPost(data);
  } catch (error) {
    console.error('게시글 조회 오류:', error);
    return null;
  }
}

/**
 * 게시글 생성
 */
export async function createPost(input: {
  title: string;
  content: string;
  author_name?: string;
}): Promise<Post> {
  try {
    const supabase = createSupabaseClient();

    const { data, error } = await supabase
      .from('posts')
      .insert({
        title: input.title,
        content: input.content,
        author_name: input.author_name || '익명',
      })
      .select()
      .single();

    if (error) {
      console.error('게시글 생성 오류:', error);
      throw error;
    }

    if (!data) {
      throw new Error('게시글 생성 후 데이터를 받아오지 못했습니다.');
    }

    return mapRowToPost(data);
  } catch (error) {
    console.error('게시글 생성 오류:', error);
    throw error;
  }
}

/**
 * 게시글 수정
 */
export async function updatePost(
  id: string,
  input: {
    title?: string;
    content?: string;
    author_name?: string;
  }
): Promise<Post> {
  try {
    const supabase = createSupabaseClient();

    // 업데이트할 필드만 구성
    const updateData: Partial<PostRow> = {};
    if (input.title !== undefined) updateData.title = input.title;
    if (input.content !== undefined) updateData.content = input.content;
    if (input.author_name !== undefined) updateData.author_name = input.author_name;

    const { data, error } = await supabase
      .from('posts')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      // 404 에러는 null 반환
      if (error.code === 'PGRST116') {
        throw new Error('게시글을 찾을 수 없습니다.');
      }
      console.error('게시글 수정 오류:', error);
      throw error;
    }

    if (!data) {
      throw new Error('게시글 수정 후 데이터를 받아오지 못했습니다.');
    }

    return mapRowToPost(data);
  } catch (error) {
    console.error('게시글 수정 오류:', error);
    throw error;
  }
}

/**
 * 게시글 삭제
 */
export async function deletePost(id: string): Promise<void> {
  try {
    const supabase = createSupabaseClient();

    const { error } = await supabase
      .from('posts')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('게시글 삭제 오류:', error);
      throw error;
    }
  } catch (error) {
    console.error('게시글 삭제 오류:', error);
    throw error;
  }
}
