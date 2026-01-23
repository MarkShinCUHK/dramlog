---
name: Supabase Anonymous Auth + RLS 설정 (최우선)
overview: Supabase Anonymous Auth를 활성화하고 RLS 정책을 설정하여 보안을 강화하고 익명 사용자를 지원합니다. 모든 기능의 기반이 되는 중요한 설정입니다.
todos: []
---

# Supabase Anonymous Auth + RLS 설정 (최우선)

## 목표
익명 사용자도 인증된 사용자로 처리하여 RLS 정책을 적용하고, 데이터베이스 레벨에서 보안을 강화합니다.

## 현재 상태
- ✅ 코드 작업 완료: RLS 정책 SQL, Anonymous Auth 헬퍼 함수, 세션 토큰 지원 등
- ⚠️ Supabase 대시보드 설정 필요: Anonymous Auth 활성화, RLS 정책 실행

## 구현 계획

### 1. Supabase 대시보드 설정

#### 1.1 Anonymous Auth 활성화
- **위치**: Supabase 대시보드 → Authentication → Providers
- **작업**: "Anonymous" 프로바이더 찾기 → "Enable Anonymous Sign-ins" 토글 활성화 → 저장
- **목적**: 익명 사용자도 인증된 사용자로 처리하여 RLS 정책 적용 가능

#### 1.2 RLS 정책 적용
- **위치**: Supabase 대시보드 → SQL Editor
- **작업**: `supabase-schema.sql` 파일의 RLS 설정 부분 실행
- **SQL 위치**: `supabase-schema.sql` 파일의 67번째 줄부터 시작하는 RLS 정책 부분

### 2. RLS 정책 설명

#### 2.1 posts 테이블 정책
- **읽기**: 모든 사용자 (익명 포함) 읽기 가능
  ```sql
  CREATE POLICY "Anyone can read posts"
  ON posts FOR SELECT
  USING (true);
  ```
- **작성**: 모든 사용자 (익명 포함) 작성 가능
  ```sql
  CREATE POLICY "Anyone can insert posts"
  ON posts FOR INSERT
  WITH CHECK (true);
  ```
- **수정**: 
  - 로그인 글: 작성자 본인만 (`auth.uid() = user_id`)
  - 익명 글: RLS는 허용하지만 서버에서 비밀번호 검증
  ```sql
  CREATE POLICY "Users can update own posts or anonymous posts"
  ON posts FOR UPDATE
  USING (
    (user_id IS NOT NULL AND auth.uid() = user_id)
    OR
    (user_id IS NULL)
  );
  ```
- **삭제**: 
  - 로그인 글: 작성자 본인만 (`auth.uid() = user_id`)
  - 익명 글: RLS는 허용하지만 서버에서 비밀번호 검증
  ```sql
  CREATE POLICY "Users can delete own posts or anonymous posts"
  ON posts FOR DELETE
  USING (
    (user_id IS NOT NULL AND auth.uid() = user_id)
    OR
    (user_id IS NULL)
  );
  ```

#### 2.2 comments 테이블 정책
- **읽기**: 모든 사용자 읽기 가능
- **작성**: 로그인 사용자만 (`auth.role() = 'authenticated'`)
- **수정/삭제**: 작성자 본인만 (`auth.uid() = user_id`)

#### 2.3 likes 테이블 정책
- **읽기**: 모든 사용자 읽기 가능
- **작성/삭제**: 로그인 사용자만 (`auth.role() = 'authenticated'`)

### 3. 코드 변경 사항 (이미 완료)

#### 3.1 Anonymous Auth 헬퍼 함수
- **파일**: `src/lib/server/supabase/auth.ts`
- **함수**:
  - `createAnonymousSession()`: 익명 세션 생성
  - `getUserOrCreateAnonymous()`: 세션이 없으면 익명 세션 생성
  - `getUser()`: 익명 사용자 정보 포함 (`isAnonymous` 필드)

#### 3.2 세션 토큰을 사용하는 클라이언트
- **파일**: `src/lib/server/supabase/client.ts`
- **함수**: `createSupabaseClientWithSession()`: 세션 토큰을 사용하는 클라이언트 생성

#### 3.3 게시글 작성 시 익명 세션 생성
- **파일**: `src/routes/write/+page.server.ts`
- **변경**: `getUserOrCreateAnonymous()` 사용하여 익명 사용자도 세션 생성

#### 3.4 쿼리 함수 세션 토큰 지원
- **파일**: `src/lib/server/supabase/queries/posts.ts`
- **변경**: `createPost()` 함수에 세션 토큰 파라미터 추가

### 4. 테스트 방법

#### 사전 준비 (필수)
1. **Supabase 대시보드 설정**:
   - Supabase 대시보드 → Authentication → Providers → Anonymous 활성화
   - Supabase 대시보드 → SQL Editor에서 `supabase-schema.sql`의 RLS 정책 실행 (67번째 줄부터)

2. **개발 서버 실행**:
   ```bash
   npm run dev
   ```

3. **브라우저 개발자 도구 열기**:
   - F12 또는 우클릭 → 검사
   - Application 탭 → Cookies 확인 준비

#### 4.1 익명 사용자 게시글 작성 테스트
**목적**: 익명 사용자가 게시글을 작성할 수 있고, 세션이 자동 생성되는지 확인

**절차**:
1. 브라우저에서 로그아웃 (또는 시크릿 모드 사용)
2. `http://localhost:5173/write` 접속
3. 개발자 도구 → Application → Cookies 확인
   - 초기에는 `sb-access-token`, `sb-refresh-token` 쿠키가 없어야 함
4. 게시글 작성:
   - 제목: "테스트 게시글"
   - 내용: "익명 사용자 테스트"
   - 비밀번호: "1234"
   - 비밀번호 확인: "1234"
   - 작성하기 클릭
5. 확인 사항:
   - ✅ 게시글이 정상적으로 작성됨
   - ✅ 개발자 도구 → Application → Cookies에서 `sb-access-token`, `sb-refresh-token` 쿠키가 생성됨
   - ✅ 게시글 상세 페이지로 리다이렉트됨
   - ✅ 작성자명이 "익명의 위스키 러버" 또는 입력한 이름으로 표시됨

**Supabase 대시보드에서 확인**:
- Table Editor → posts 테이블에서 방금 작성한 게시글 확인
- `user_id`가 `NULL`인지 확인 (익명 글)
- `edit_password_hash`가 해시로 저장되었는지 확인

#### 4.2 로그인 사용자 게시글 작성 테스트
**목적**: 로그인 사용자가 게시글을 작성할 수 있고, `user_id`가 저장되는지 확인

**절차**:
1. 브라우저에서 로그인 (`/login`)
2. `http://localhost:5173/write` 접속
3. 게시글 작성:
   - 제목: "로그인 사용자 테스트"
   - 내용: "로그인 사용자 게시글"
   - 비밀번호 입력 필드가 보이지 않아야 함
   - 작성하기 클릭
4. 확인 사항:
   - ✅ 게시글이 정상적으로 작성됨
   - ✅ 작성자명이 로그인한 사용자의 닉네임 또는 이메일로 표시됨

**Supabase 대시보드에서 확인**:
- Table Editor → posts 테이블에서 방금 작성한 게시글 확인
- `user_id`가 로그인한 사용자의 UUID인지 확인
- `edit_password_hash`가 `NULL`인지 확인 (로그인 글은 비밀번호 없음)

#### 4.3 RLS 정책 테스트 - 로그인 글 수정/삭제 권한
**목적**: 다른 사용자가 다른 사용자의 게시글을 수정/삭제할 수 없는지 확인

**절차**:
1. 사용자 A로 로그인
2. 게시글 작성 (예: "사용자 A의 게시글")
3. 로그아웃
4. 사용자 B로 로그인 (다른 계정)
5. 사용자 A가 작성한 게시글 상세 페이지 접속
6. 수정/삭제 버튼이 보이지 않거나 클릭 시 권한 오류가 발생하는지 확인

**예상 결과**:
- ✅ 다른 사용자의 게시글은 수정/삭제 불가
- ✅ RLS 정책에 의해 데이터베이스 레벨에서 차단됨

#### 4.4 익명 글 수정/삭제 테스트
**목적**: 익명 글을 비밀번호로 수정/삭제할 수 있는지 확인

**절차**:
1. 로그아웃 상태에서 익명으로 게시글 작성
   - 제목: "익명 글 수정 테스트"
   - 내용: "원본 내용"
   - 비밀번호: "1234"
2. 게시글 상세 페이지에서 수정 버튼 클릭
3. 비밀번호 입력: "1234"
4. 내용 수정: "수정된 내용"
5. 수정하기 클릭
6. 확인 사항:
   - ✅ 수정이 정상적으로 완료됨
   - ✅ 수정된 내용이 표시됨
7. 삭제 테스트:
   - 게시글 상세 페이지에서 삭제 버튼 클릭
   - 비밀번호 입력: "1234"
   - 삭제 확인
   - ✅ 게시글이 삭제됨

**잘못된 비밀번호 테스트**:
- 비밀번호를 틀리게 입력하면 수정/삭제가 실패해야 함

#### 4.5 댓글/좋아요 RLS 정책 테스트
**목적**: 댓글과 좋아요가 로그인 사용자만 가능한지 확인

**절차**:
1. 로그아웃 상태에서 게시글 상세 페이지 접속
2. 댓글 작성 시도
   - ✅ 댓글 작성 폼이 보이지 않거나 로그인 요구 메시지 표시
3. 좋아요 버튼 클릭 시도
   - ✅ 좋아요가 작동하지 않거나 로그인 요구 메시지 표시
4. 로그인 후 다시 시도
   - ✅ 댓글 작성 및 좋아요가 정상 작동

#### 4.6 콘솔 에러 확인
**목적**: 익명 세션 생성 실패 등 에러 확인

**절차**:
1. 개발자 도구 → Console 탭 열기
2. 익명 사용자로 게시글 작성 시도
3. 에러 메시지 확인:
   - "Anonymous session creation failed" → Anonymous Auth가 활성화되지 않음
   - "RLS policy violation" → RLS 정책이 제대로 적용되지 않음
   - 기타 에러 메시지 확인

#### 4.7 네트워크 요청 확인
**목적**: 세션 토큰이 제대로 전달되는지 확인

**절차**:
1. 개발자 도구 → Network 탭 열기
2. 게시글 작성 시도
3. POST 요청 확인:
   - Request Headers에 `Authorization: Bearer <token>`이 포함되는지 확인
   - 또는 Supabase API 요청에 세션 토큰이 포함되는지 확인

## 테스트 체크리스트

### 필수 테스트 항목
- [ ] 익명 사용자 게시글 작성 성공
- [ ] 익명 세션 자동 생성 확인 (쿠키 확인)
- [ ] 로그인 사용자 게시글 작성 성공
- [ ] 로그인 글의 `user_id` 저장 확인
- [ ] 다른 사용자의 게시글 수정/삭제 불가 확인
- [ ] 익명 글 비밀번호로 수정 성공
- [ ] 익명 글 비밀번호로 삭제 성공
- [ ] 잘못된 비밀번호로 수정/삭제 실패 확인
- [ ] 로그아웃 상태에서 댓글/좋아요 불가 확인
- [ ] 로그인 상태에서 댓글/좋아요 가능 확인

### 문제 해결

#### 익명 세션 생성 실패
- **증상**: "Anonymous session creation failed" 에러
- **해결**: Supabase 대시보드에서 Anonymous Auth 활성화 확인

#### RLS 정책 오류
- **증상**: "RLS policy violation" 또는 권한 오류
- **해결**: Supabase 대시보드 → SQL Editor에서 RLS 정책이 제대로 실행되었는지 확인

#### 게시글 작성 실패
- **증상**: 게시글 작성 시 에러 발생
- **해결**: 
  1. 개발자 도구 Console에서 에러 메시지 확인
  2. Supabase 대시보드 → Table Editor에서 테이블 구조 확인
  3. RLS 정책이 올바르게 설정되었는지 확인

### 5. 주의사항

- 익명 사용자는 `user_id`가 `NULL`로 저장됨
- 익명 글의 수정/삭제는 서버 사이드에서 비밀번호 검증 필요
- RLS 정책은 데이터베이스 레벨에서 적용되므로, 모든 쿼리가 정책을 따름
- 세션 토큰이 없는 경우 기본 클라이언트 사용 (RLS 정책은 여전히 적용됨)
- Anonymous Auth를 활성화하지 않으면 익명 세션 생성이 실패함

### 6. 향후 개선 사항

- 모든 쿼리 함수에 세션 토큰 전달 (현재는 createPost만 적용)
- 댓글/좋아요 기능도 세션 토큰 사용하도록 수정
- 익명 세션 자동 갱신 로직 추가
- 세션 만료 시 자동 재생성 로직

## 파일 목록

### 수정된 파일 (이미 완료)
- `supabase-schema.sql`: RLS 정책 SQL 추가
- `src/lib/server/supabase/auth.ts`: Anonymous Auth 헬퍼 함수 추가
- `src/lib/server/supabase/client.ts`: 세션 토큰을 사용하는 클라이언트 생성 함수 추가
- `src/lib/server/supabase/queries/posts.ts`: `createPost` 함수에 세션 토큰 지원 추가
- `src/routes/write/+page.server.ts`: 익명 사용자도 세션 생성하도록 수정

### 참고 문서
- `SUPABASE_RLS_SETUP.md`: 상세 설정 가이드 (참고용)

## 완료 상태

**코드 작업: 완료 ✅**
**Supabase 대시보드 설정: 대기 중 ⚠️**

Supabase 대시보드에서 Anonymous Auth 활성화 및 RLS 정책 실행만 하면 완료됩니다.
