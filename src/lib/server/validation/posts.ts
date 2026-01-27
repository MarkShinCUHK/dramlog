export function plainTextFromHtml(html: string): string {
  return (html || '').replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
}

export function parseTags(value: string): string[] {
  return (value || '')
    .split(',')
    .map((tag) => tag.trim().replace(/^#/, ''))
    .filter((tag) => tag.length > 0);
}

type ValidationContext = {
  isLoggedIn: boolean;
  isAnonymousPost: boolean;
  editPassword?: string | null;
  editPasswordConfirm?: string | null;
  requirePasswordConfirm?: boolean;
};

export function validatePostInput(input: { title?: string | null; content?: string | null }, ctx: ValidationContext) {
  const fieldErrors: Record<string, string> = {};
  const requirePasswordConfirm = ctx.requirePasswordConfirm ?? true;

  const title = input.title ?? '';
  const content = input.content ?? '';

  if (!title || title.trim().length === 0) {
    fieldErrors.title = '제목을 입력해주세요.';
  }

  if (!content || plainTextFromHtml(content).length === 0) {
    fieldErrors.content = '내용을 입력해주세요.';
  }

  if (!ctx.isLoggedIn) {
    const editPassword = ctx.editPassword ?? '';
    const editPasswordConfirm = ctx.editPasswordConfirm ?? '';

    if (!editPassword || editPassword.length < 4) {
      fieldErrors.editPassword = '비밀번호는 4자 이상으로 입력해주세요.';
    }

    if (requirePasswordConfirm) {
      if (!editPasswordConfirm) {
        fieldErrors.editPasswordConfirm = '비밀번호 확인을 입력해주세요.';
      } else if (editPassword && editPassword !== editPasswordConfirm) {
        fieldErrors.editPasswordConfirm = '비밀번호 확인이 일치하지 않습니다.';
      }
    }
  }

  if (ctx.isAnonymousPost && ctx.isLoggedIn) {
    fieldErrors.editPassword = '익명 게시글은 로그아웃 상태에서 비밀번호로만 수정할 수 있습니다.';
  }

  return {
    fieldErrors,
    hasErrors: Object.keys(fieldErrors).length > 0
  };
}
