import { listPosts } from '$lib/server/supabase/queries/posts';

export async function load() {
  try {
    // 최신 글 5개만 표시 (메인 페이지)
    const posts = await listPosts(5);
    return {
      posts
    };
  } catch (error) {
    console.error('게시글 로드 오류:', error);
    // DB 오류 시 빈 배열 반환
    return {
      posts: []
    };
  }
}
