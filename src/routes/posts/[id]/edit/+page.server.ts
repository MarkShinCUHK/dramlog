import { error, fail, redirect } from '@sveltejs/kit';
import { getPostById, updatePost } from '$lib/server/supabase/queries/posts';

export async function load({ params }) {
  try {
    const postId = params.id;

    if (!postId) {
      throw error(404, '게시글을 찾을 수 없습니다');
    }

    const post = await getPostById(postId);

    if (!post) {
      throw error(404, '게시글을 찾을 수 없습니다');
    }

    return {
      post
    };
  } catch (err) {
    // SvelteKit error는 그대로 전달
    if (err && typeof err === 'object' && 'status' in err) {
      throw err;
    }
    console.error('게시글 로드 오류:', err);
    throw error(500, '게시글을 불러오는 중 오류가 발생했습니다');
  }
}

export const actions = {
  default: async ({ request, params }) => {
    try {
      const postId = params.id;

      if (!postId) {
        return fail(400, {
          error: '게시글 ID가 없습니다.'
        });
      }

      const formData = await request.formData();
      const title = formData.get('title')?.toString();
      const content = formData.get('content')?.toString();
      const author = formData.get('author')?.toString();

      // 유효성 검사
      if (!title || !content || !author) {
        return fail(400, {
          error: '제목, 내용, 작성자를 모두 입력해주세요.',
          values: {
            title: title || '',
            content: content || '',
            author: author || ''
          }
        });
      }

      // 게시글 수정
      await updatePost(postId, {
        title,
        content,
        author_name: author
      });

      // 게시글 상세 페이지로 리다이렉트
      throw redirect(303, `/posts/${postId}`);
    } catch (err) {
      // redirect는 throw이므로 그대로 전달
      if (err && typeof err === 'object' && 'status' in err) {
        throw err;
      }

      console.error('게시글 수정 오류:', err);
      return fail(500, {
        error: '게시글 수정 중 오류가 발생했습니다.'
      });
    }
  }
};
