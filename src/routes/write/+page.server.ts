import { fail, redirect } from '@sveltejs/kit';
import { createPost } from '$lib/server/supabase/queries/posts';

export const actions = {
  default: async ({ request }) => {
    try {
      const formData = await request.formData();
      const title = formData.get('title')?.toString();
      const content = formData.get('content')?.toString();
      const author = formData.get('author')?.toString();
      const excerpt = formData.get('excerpt')?.toString();

      // 유효성 검사
      if (!title || !content || !author) {
        return fail(400, {
          error: '제목, 내용, 작성자를 모두 입력해주세요.',
          values: {
            title: title || '',
            content: content || '',
            author: author || '',
            excerpt: excerpt || ''
          }
        });
      }

      // 게시글 생성 (queries/posts.ts의 createPost 사용)
      const post = await createPost({
        title,
        content,
        author_name: author
        // excerpt는 현재 스키마에 없으므로 제외
      });

      // 게시글 상세 페이지로 리다이렉트 (id는 uuid이므로 string)
      throw redirect(303, `/posts/${post.id}`);
    } catch (error) {
      // redirect는 throw이므로 그대로 전달
      if (error && typeof error === 'object' && 'status' in error) {
        throw error;
      }

      // 에러 상세 정보 로깅
      console.error('게시글 작성 오류:', error);
      const errorMessage = error instanceof Error ? error.message : '게시글 작성 중 오류가 발생했습니다.';
      
      return fail(500, {
        error: errorMessage,
        values: {
          title: title || '',
          content: content || '',
          author: author || '',
          excerpt: excerpt || ''
        }
      });
    }
  }
};
