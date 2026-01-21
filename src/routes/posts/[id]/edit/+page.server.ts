import { error, fail, redirect } from '@sveltejs/kit';
import { getPostById, updatePost } from '$lib/server/supabase/queries/posts';
import { getUser } from '$lib/server/supabase/auth';

export async function load({ params, cookies }) {
  try {
    const postId = params.id;

    if (!postId) {
      throw error(404, '게시글을 찾을 수 없습니다');
    }

    const post = await getPostById(postId);

    if (!post) {
      throw error(404, '게시글을 찾을 수 없습니다');
    }

    const user = await getUser(cookies);

    // 정책:
    // - 익명 글: "비로그인 상태"에서만 비밀번호로 수정 가능
    // - 로그인 글: 작성자만 수정 가능
    if (!post.userId) {
      if (user) throw error(403, '익명 게시글은 로그아웃 상태에서 비밀번호로만 수정할 수 있습니다');
    } else {
      if (!user || user.id !== post.userId) {
        throw error(403, '본인의 게시글만 수정할 수 있습니다');
      }
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
  default: async ({ request, params, cookies }) => {
    try {
      const postId = params.id;

      if (!postId) {
        return fail(400, {
          error: '게시글 ID가 없습니다.'
        });
      }

      const post = await getPostById(postId);
      if (!post) {
        return fail(404, { error: '게시글을 찾을 수 없습니다.' });
      }

      const formData = await request.formData();
      const title = formData.get('title')?.toString();
      const content = formData.get('content')?.toString();
      const author = formData.get('author')?.toString();
      const editPassword = formData.get('editPassword')?.toString();
      const user = await getUser(cookies);
      const isAnonymousPost = !post.userId;
      const isOwner = !!user && !!post.userId && user.id === post.userId;

      // 유효성 검사
      if (!title || !content) {
        return fail(400, {
          error: '제목과 내용을 입력해주세요.',
          values: {
            title: title || '',
            content: content || '',
            author: author || ''
          }
        });
      }

      // 로그인 글: 작성자만 수정 가능 (비밀번호 없음)
      if (!isAnonymousPost && !isOwner) {
        return fail(403, { error: '본인의 게시글만 수정할 수 있습니다.' });
      }

      // 익명 글: "비로그인 상태"에서만 비밀번호로 수정 가능
      if (isAnonymousPost && user) {
        return fail(403, { error: '익명 게시글은 로그아웃 상태에서 비밀번호로만 수정할 수 있습니다.' });
      }
      if (isAnonymousPost && !editPassword) {
        return fail(400, {
          error: '비밀번호를 입력해주세요.',
          values: {
            title: title || '',
            content: content || '',
            author: author || ''
          }
        });
      }

      // 게시글 수정
      await updatePost(
        postId,
        {
        title,
        content,
          author_name: isAnonymousPost ? (author || undefined) : (user?.nickname || user?.email || undefined)
        },
        {
          userId: isAnonymousPost ? null : (user?.id ?? null),
          editPassword: isAnonymousPost ? editPassword : undefined
        }
      );

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
