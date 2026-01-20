import { listPosts } from '$lib/server/supabase/queries/posts';

export async function load() {
  try {
    // 전체 목록 조회 (limit 없음)
    const posts = await listPosts();
    return {
      posts
    };
  } catch (error) {
    console.error('게시글 목록 로드 오류:', error);
    return {
      posts: []
    };
  }
}
