# DramLog 개발 가이드라인

이 문서는 SvelteKit + Tailwind CSS 기반의 DramLog (위스키 리뷰/게시글 커뮤니티) 개발 시 따라야 할 상세 가이드라인을 정의합니다.

## 📋 목차
1. [프로젝트 개요](#프로젝트-개요)
2. [기술 스택](#기술-스택)
3. [SvelteKit 구조](#sveltekit-구조)
4. [Tailwind CSS 가이드](#tailwind-css-가이드)
5. [컴포넌트 설계](#컴포넌트-설계)
6. [라우팅 구조](#라우팅-구조)
7. [디자인 시스템](#디자인-시스템)
8. [코딩 컨벤션](#코딩-컨벤션)

---

## 프로젝트 개요

### 목표
- DramLog: 위스키 리뷰 및 게시글 커뮤니티 플랫폼
- 1인 개발 기준의 MVP 구현
- 서버사이드 렌더링(SSR) 기반의 빠른 로딩
- Tailwind CSS만 사용한 스타일링
- Supabase (PostgreSQL 기반 BaaS) 사용

### 현재 단계 (2026-01-20 기준)
- ✅ 기본 라우트 구조 설계 및 구현
- ✅ Tailwind 기반 UI 스켈레톤 생성
- ✅ 위스키 커뮤니티 느낌의 색감/톤 적용
- ✅ MVP 기능 구현 완료
  - ✅ 메인 페이지 (커뮤니티 소개 + 최신 글 목록)
  - ✅ 게시글 리스트 페이지
  - ✅ 게시글 상세 페이지
  - ✅ 글 작성 페이지 (Supabase 저장)
  - ✅ 게시글 목록 페이지 (Supabase 조회)
  - ✅ 게시글 상세 페이지 (Supabase 조회)
  - ✅ 공통 레이아웃 (Header, Footer)
- ✅ Supabase 통합 완료 (글 작성/목록/상세 - 완전 전환)
- ✅ 데이터베이스 스키마 생성 (Supabase posts 테이블)
- ✅ 게시글 CRUD 기능 구현 (생성, 조회, 목록)
- ✅ Supabase 쿼리 계층 구조 구축 (`src/lib/server/supabase/queries/posts.ts`)
- ✅ 프로젝트 이름 DramLog로 통일
- ✅ 날짜 2026-01-20 기준으로 업데이트

---

## 기술 스택

### 핵심 스택
- **SvelteKit**: 프레임워크 (SSR 지원)
- **Tailwind CSS**: 유틸리티 기반 CSS 프레임워크
- **Supabase**: PostgreSQL 기반 BaaS (Backend as a Service)
  - 데이터베이스: PostgreSQL (Supabase 호스팅)
  - 인증: Supabase Auth (향후 사용 예정)
  - 스토리지: Supabase Storage (향후 사용 예정)
- **TypeScript**: 타입 안정성 (선택사항, 현재는 JavaScript)

### 개발 도구
- **Vite**: 빌드 도구 (SvelteKit 내장)
- **ESLint**: 코드 품질 관리
- **Prettier**: 코드 포맷팅 (선택사항)

### 현재 제외
- ❌ 인증 시스템 (향후 추가)
- ❌ 복잡한 상태 관리 라이브러리

---

## SvelteKit 구조

### 파일 기반 라우팅

```
src/routes/
├── +layout.svelte          # 루트 레이아웃 (헤더/푸터)
├── +page.svelte            # 메인 페이지 (/)
├── +error.svelte           # 에러 페이지
├── posts/
│   ├── +page.svelte        # 게시글 리스트 (/posts)
│   ├── +page.server.ts     # 서버 로직 (Supabase)
│   └── [id]/
│       ├── +page.svelte    # 게시글 상세 (/posts/[id])
│       └── +page.server.ts # 서버 로직 (Supabase)
└── write/
    ├── +page.svelte        # 글 작성 (/write)
    └── +page.server.ts     # 서버 액션 (Supabase)
```

### 주요 파일 타입
- `+page.svelte`: 페이지 컴포넌트
- `+layout.svelte`: 레이아웃 컴포넌트
- `+page.server.ts`: 서버 사이드 로직 (load 함수)
- `+page.ts`: 클라이언트/서버 공통 로직

### 예시: 서버 로직 (Supabase 쿼리 계층 사용)

```typescript
// src/routes/posts/+page.server.ts
import { listPosts } from '$lib/server/supabase/queries/posts';

export async function load() {
  try {
    // Supabase에서 게시글 목록 조회
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
```

### 데이터 계층 구조

```
src/lib/server/supabase/
├── client.ts              # Supabase 클라이언트 생성
├── types.ts               # PostRow (DB), Post (UI) 타입 정의
└── queries/
    └── posts.ts           # 게시글 쿼리 함수들
        - listPosts()       # 목록 조회
        - getPostById()     # 상세 조회
        - createPost()      # 생성
```

**데이터 변환 흐름:**
- Supabase에서 가져온 `PostRow` (DB 스키마) → `mapRowToPost()` → `Post` (UI용 DTO)
- 모든 DB 접근은 `queries/posts.ts`의 함수들을 통해서만 수행
- `+page.server.ts`에서는 직접 Supabase 클라이언트를 사용하지 않고, 쿼리 함수만 호출

---

## Tailwind CSS 가이드

### 기본 원칙
- **유틸리티 클래스 우선**: 모든 스타일은 Tailwind 클래스로 작성
- **일반 CSS 최소화**: Tailwind로 불가능한 경우만 예외
- **커스텀 클래스 지양**: `@apply` 사용 최소화

### 좋은 예

```svelte
<!-- ✅ 좋은 예: Tailwind 유틸리티 클래스 사용 -->
<button class="px-4 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition-colors">
  작성하기
</button>

<div class="max-w-4xl mx-auto px-4 py-8">
  <h1 class="text-3xl font-bold text-amber-900 mb-4">위스키 리뷰</h1>
</div>
```

### 나쁜 예

```svelte
<!-- ❌ 나쁜 예: 인라인 스타일 또는 커스텀 CSS -->
<button style="padding: 8px 16px; background: #d97706;">
  작성하기
</button>

<style>
  .container {
    max-width: 896px;
    margin: 0 auto;
  }
</style>
```

### Tailwind 설정 (tailwind.config.js)

```javascript
/** @type {import('tailwindcss').Config} */
export default {
  content: ['./src/**/*.{html,js,svelte,ts}'],
  theme: {
    extend: {
      colors: {
        // 위스키 테마 색상
        whiskey: {
          50: '#fef8f0',
          100: '#fef0d9',
          200: '#fcdeb3',
          300: '#f9c582',
          400: '#f5a84d',
          500: '#f18a1c', // Primary
          600: '#d97706', // Hover
          700: '#b45309',
          800: '#92400e',
          900: '#78350f',
        },
      },
    },
  },
  plugins: [],
};
```

---

## 컴포넌트 설계

### 컴포넌트 구조

```
src/lib/
├── components/
│   ├── Header.svelte      # 헤더 컴포넌트 ✅
│   ├── Footer.svelte     # 푸터 컴포넌트 ✅
│   └── PostCard.svelte   # 게시글 카드 컴포넌트 ✅
├── db/
│   ├── index.ts          # DB 연결 유틸리티 ✅
│   ├── posts.ts          # 게시글 쿼리 함수 ✅
│   ├── schema.sql        # 데이터베이스 스키마 ✅
│   └── migrate.ts        # 마이그레이션 스크립트 ✅
└── data/
    └── dummyPosts.ts     # 더미 데이터 (참고용) ✅
```

### 컴포넌트 예시

```svelte
<!-- src/lib/components/PostCard.svelte -->
<script>
  export let post;
</script>

<article class="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
  <h2 class="text-xl font-bold text-gray-900 mb-2">
    <a href="/posts/{post.id}" class="hover:text-whiskey-600">
      {post.title}
    </a>
  </h2>
  <p class="text-gray-600 mb-4">{post.excerpt}</p>
  <div class="flex items-center justify-between text-sm text-gray-500">
    <span>{post.author}</span>
    <span>{post.createdAt}</span>
  </div>
</article>
```

### 컴포넌트 사용

```svelte
<!-- src/routes/posts/+page.svelte -->
<script>
  import PostCard from '$lib/components/PostCard.svelte';
  
  export let data;
</script>

<div class="max-w-4xl mx-auto px-4 py-8">
  <h1 class="text-3xl font-bold text-whiskey-900 mb-8">게시글 목록</h1>
  <div class="space-y-4">
    {#each data.posts as post}
      <PostCard {post} />
    {/each}
  </div>
</div>
```

---

## 라우팅 구조

### MVP 라우트

| 경로 | 파일 | 설명 |
|------|------|------|
| `/` | `src/routes/+page.svelte` | 메인 페이지 (커뮤니티 소개 + 최신 글) |
| `/posts` | `src/routes/posts/+page.svelte` | 게시글 리스트 |
| `/posts/[id]` | `src/routes/posts/[id]/+page.svelte` | 게시글 상세 |
| `/write` | `src/routes/write/+page.svelte` | 글 작성 |

### 네비게이션 예시

```svelte
<!-- src/lib/components/Header.svelte -->
<nav class="bg-whiskey-900 text-white">
  <div class="max-w-6xl mx-auto px-4 py-4">
    <div class="flex items-center justify-between">
      <a href="/" class="text-2xl font-bold">DramLog</a>
      <div class="flex gap-4">
        <a href="/posts" class="hover:text-whiskey-300">게시글</a>
        <a href="/write" class="hover:text-whiskey-300">작성하기</a>
      </div>
    </div>
  </div>
</nav>
```

---

## 디자인 시스템

### 색상 팔레트 (위스키 테마)

```javascript
// Tailwind 설정에서 정의
whiskey: {
  50: '#fef8f0',   // 가장 밝은 베이지
  100: '#fef0d9',  // 밝은 크림
  200: '#fcdeb3',  // 라이트 골드
  300: '#f9c582',  // 골드
  400: '#f5a84d',  // 앰버
  500: '#f18a1c',  // Primary (주요 액션)
  600: '#d97706',  // Hover 상태
  700: '#b45309',  // 다크 앰버
  800: '#92400e',  // 브라운
  900: '#78350f',  // 다크 브라운 (텍스트)
}
```

### 타이포그래피

- **제목 (h1)**: `text-4xl font-bold text-whiskey-900`
- **제목 (h2)**: `text-3xl font-bold text-whiskey-800`
- **제목 (h3)**: `text-2xl font-semibold text-whiskey-800`
- **본문**: `text-base text-gray-700`
- **작은 텍스트**: `text-sm text-gray-500`

### 간격 시스템

Tailwind 기본 간격 사용:
- `p-4` (16px), `p-6` (24px), `p-8` (32px)
- `gap-4`, `gap-6`, `gap-8`
- `space-y-4`, `space-y-6`

### 버튼 스타일

```svelte
<!-- Primary 버튼 -->
<button class="px-6 py-3 bg-whiskey-600 text-white rounded-lg hover:bg-whiskey-700 transition-colors font-medium">
  작성하기
</button>

<!-- Secondary 버튼 -->
<button class="px-6 py-3 bg-white text-whiskey-600 border-2 border-whiskey-600 rounded-lg hover:bg-whiskey-50 transition-colors font-medium">
  취소
</button>
```

---

## 코딩 컨벤션

### Svelte 컴포넌트 구조

```svelte
<script>
  // 1. Imports
  import Component from '$lib/components/Component.svelte';
  
  // 2. Props
  export let prop1;
  export let prop2 = 'default';
  
  // 3. Reactive statements
  $: computed = prop1 * 2;
  
  // 4. Functions
  function handleClick() {
    // ...
  }
</script>

<!-- 5. Markup -->
<div class="...">
  <!-- ... -->
</div>

<!-- 6. Styles (최소화) -->
<style>
  /* Tailwind로 불가능한 경우만 */
</style>
```

### 네이밍 규칙

- **컴포넌트**: PascalCase (`PostCard.svelte`)
- **변수/함수**: camelCase (`getPostData`, `handleSubmit`)
- **상수**: UPPER_SNAKE_CASE (`API_BASE_URL`)
- **파일**: kebab-case 또는 PascalCase (컴포넌트는 PascalCase)

### 주석 규칙

```svelte
<script>
  // 한국어 주석 사용
  // 게시글 데이터를 가져옵니다
  export let data;
  
  /**
   * 게시글을 삭제합니다
   * @param {number} id - 게시글 ID
   */
  async function deletePost(id) {
    // ...
  }
</script>
```

---

## 더미 데이터 구조

### 게시글 데이터

```typescript
interface Post {
  id: number;
  title: string;
  content: string;
  author: string;
  createdAt: string;
  excerpt?: string;
  views?: number;
  likes?: number;
}
```

### 더미 데이터 구조 (중앙화)

더미 데이터는 `src/lib/data/dummyPosts.ts`에 중앙화되어 있으며, 각 페이지에서 import하여 사용합니다.

```typescript
// src/lib/data/dummyPosts.ts
export const dummyPosts = [
  {
    id: 1,
    title: '맥캘란 12년 싱글 몰트 리뷰',
    content: '맥캘란 12년은...',
    author: '위스키러버',
    createdAt: '2026-01-20',
    excerpt: '맥캘란 12년의 깊은 맛과 향을 리뷰합니다.',
    views: 123,
    likes: 45
  },
  // ...
];

// src/routes/posts/+page.server.ts
import { dummyPosts } from '$lib/data/dummyPosts';

export async function load() {
  return {
    posts: dummyPosts
  };
}
```

---

## 성능 최적화

### SvelteKit 최적화
- SSR 활용으로 초기 로딩 속도 향상
- 코드 스플리팅 자동 적용
- 이미지 최적화 (`@sveltejs/enhanced-img` 사용 고려)

### Tailwind 최적화
- Production 빌드 시 미사용 CSS 자동 제거
- JIT 모드로 필요한 클래스만 생성

---

## 접근성

### 기본 접근성 고려사항
- 시맨틱 HTML 태그 사용 (`<header>`, `<nav>`, `<main>`, `<article>`)
- ARIA 레이블 추가 (필요시)
- 키보드 네비게이션 지원
- 색상 대비 충분히 확보 (WCAG AA 기준)

```svelte
<!-- 좋은 예 -->
<button 
  type="button"
  aria-label="게시글 작성하기"
  class="..."
>
  작성하기
</button>
```

---

## 다음 단계

### MVP 1단계 완료 ✅ (2026-01-20)
1. ✅ 기본 라우트 구조
2. ✅ Tailwind UI 스켈레톤
3. ✅ 위스키 테마 색상 적용
4. ✅ 메인 페이지 구현
5. ✅ 게시글 리스트/상세 페이지
6. ✅ 글 작성 페이지
7. ✅ 공통 컴포넌트 (Header, Footer, PostCard)
8. ✅ 더미 데이터 구조화 및 중앙화

### MVP 2단계 완료 ✅ (2026-01-20)
- ✅ Supabase 통합 완료 (글 작성/목록/상세 - 완전 전환)
- ✅ Supabase 쿼리 계층 구조 구축 (`src/lib/server/supabase/queries/posts.ts`)
- ✅ 게시글 CRUD 기능 (생성, 조회, 목록) 완료
- ✅ 레거시 PostgreSQL 코드 제거 완료

### MVP 3단계: 게시글 관리 기능 (완료 ✅)
**목표**: 게시글 수정 및 삭제 기능 구현

1. ✅ **게시글 수정 기능**
   - 라우트: `/posts/[id]/edit` 구현 완료
   - 파일 구조:
     - `src/routes/posts/[id]/edit/+page.svelte` (수정 폼) ✅
     - `src/routes/posts/[id]/edit/+page.server.ts` (서버 액션) ✅
   - 기능:
     - 기존 게시글 데이터 로드 (`load` 함수) ✅
     - 수정 폼에 기존 데이터 자동 입력 ✅
     - 서버 액션으로 업데이트 (`updatePost` 함수) ✅
     - 수정 완료 후 상세 페이지로 리다이렉트 ✅
   - 쿼리 함수: `src/lib/server/supabase/queries/posts.ts`에 `updatePost(id, input)` 추가 완료 ✅
   - 권한: 현재는 모든 사용자 수정 가능 (MVP 4에서 본인 글만 수정 가능하도록 변경 예정)

2. ✅ **게시글 삭제 기능**
   - 위치: 게시글 상세 페이지 (`/posts/[id]`) ✅
   - 기능:
     - 삭제 버튼 추가 ✅
     - 삭제 확인 다이얼로그 (confirm) ✅
     - 서버 액션으로 삭제 (`deletePost` 함수) ✅
     - 삭제 완료 후 게시글 목록으로 리다이렉트 ✅
   - 쿼리 함수: `src/lib/server/supabase/queries/posts.ts`에 `deletePost(id)` 추가 완료 ✅
   - 권한: 현재는 모든 사용자 삭제 가능 (MVP 4에서 본인 글만 삭제 가능하도록 변경 예정)

3. ✅ **구현 세부사항**
   - 에러 처리: 존재하지 않는 게시글, 잘못된 ID 등 처리 완료 ✅
   - UI: Tailwind로 버튼 스타일링 완료 ✅
   - 사용자 피드백: confirm 다이얼로그로 삭제 확인 ✅

### MVP 4단계: 인증 시스템 (다음 단계)
**목표**: 사용자 인증 및 권한 관리 구현

1. **인증 방식 선택**
   - 옵션 1: **Auth.js** (SvelteKit 공식, 추천)
     - 장점: 표준화된 인증, 다양한 프로바이더 지원
     - 단점: 초기 설정 복잡
   - 옵션 2: **직접 구현** (세션 기반)
     - 장점: 단순하고 제어 가능
     - 단점: 보안 구현에 주의 필요
   - 옵션 3: **Supabase Auth** (필요시)
     - 장점: 완전 관리형, 빠른 구현
     - 단점: 외부 서비스 의존

2. **인증 기능 구현**
   - 라우트:
     - `/login` (로그인 페이지)
     - `/signup` (회원가입 페이지)
   - DB 스키마:
     - `users` 테이블 생성 (id, email, password_hash, username, created_at)
     - `posts` 테이블에 `user_id` 컬럼 추가 (외래키)
   - 세션 관리:
     - SvelteKit의 `cookies` 사용
     - JWT 또는 세션 토큰 방식

3. **권한 관리**
   - 본인 게시글만 수정/삭제 가능
   - 로그인한 사용자만 글 작성 가능
   - 미로그인 사용자는 읽기만 가능

### MVP 5단계: 핵심 기능 강화
**목표**: 커뮤니티 기능 확장

1. **검색 기능**
   - 라우트: `/search` 또는 쿼리 파라미터 (`/posts?q=검색어`)
   - 기능:
     - 게시글 제목/내용 검색
     - 검색 결과 페이지
     - 하이라이트 표시 (선택사항)
   - DB 최적화:
     - `posts` 테이블에 `title`, `content` 컬럼에 인덱스 추가 고려
     - Full-text search 활용 (PostgreSQL의 `tsvector`)

2. **댓글 시스템**
   - DB 스키마:
     - `comments` 테이블 생성 (id, post_id, user_id, content, created_at, updated_at)
   - 기능:
     - 게시글 상세 페이지에 댓글 섹션
     - 댓글 작성/수정/삭제
     - 댓글 목록 표시 (최신순/오래된순)
   - 컴포넌트:
     - `CommentList.svelte`
     - `CommentForm.svelte`
     - `CommentItem.svelte`

3. **좋아요 기능**
   - DB 스키마:
     - 옵션 1: `posts` 테이블의 `likes` 컬럼 활용 (간단)
     - 옵션 2: `likes` 테이블 생성 (user_id, post_id) - 중복 좋아요 방지
   - 기능:
     - 좋아요 버튼 (하트 아이콘)
     - 좋아요 카운트 표시
     - 좋아요 토글 (클릭 시 추가/제거)

### MVP 6단계: UI/UX 개선
**목표**: 사용자 경험 향상 및 반응형 최적화

1. **반응형 디자인**
   - 모바일 (< 640px): 단일 컬럼, 터치 친화적 버튼
   - 태블릿 (640px - 1024px): 2컬럼 레이아웃
   - 데스크톱 (> 1024px): 최적화된 레이아웃
   - Tailwind의 반응형 유틸리티 클래스 활용

2. **사용자 경험 개선**
   - 로딩 상태:
     - 스켈레톤 UI 또는 스피너
     - `{#await}` 블록 활용
   - 에러 처리:
     - 친화적인 에러 메시지
     - 에러 페이지 (`+error.svelte`)
   - 피드백:
     - 성공 메시지 (토스트 알림)
     - 폼 유효성 검사 실시간 표시
   - 페이지네이션:
     - 게시글 목록 페이지네이션
     - DB 쿼리 최적화 (LIMIT, OFFSET)

3. **성능 최적화**
   - 이미지 최적화 (이미지 업로드 기능 추가 시):
     - Lazy loading
     - WebP 형식 지원
     - 썸네일 생성
   - 코드 스플리팅:
     - SvelteKit의 자동 코드 스플리팅 활용
   - DB 최적화:
     - 인덱스 추가
     - 쿼리 최적화
     - 연결 풀링 (이미 구현됨)

### 향후 추가 예정
- 이미지 업로드 (로컬 스토리지 또는 클라우드 스토리지)
- 사용자 프로필 페이지
- 북마크 기능
- 태그 시스템
- 위스키 정보 데이터베이스 (위스키 종류, 브랜드, 리뷰 등)
- 알림 시스템
- 소셜 공유 기능

---

## Supabase 설정 및 사용 가이드

### Supabase 프로젝트 설정

1. **Supabase 프로젝트 생성**
   - [Supabase 대시보드](https://app.supabase.com)에서 새 프로젝트 생성
   - 프로젝트 URL과 Anon Key 확인

2. **환경 변수 설정**
   - `.env` 파일에 다음 변수 추가:
   ```env
   PUBLIC_SUPABASE_URL=https://your-project.supabase.co
   PUBLIC_SUPABASE_ANON_KEY=your-anon-key
   ```
   - **주의**: `PUBLIC_` 접두사가 붙은 변수는 클라이언트에 노출되지만, ANON_KEY는 RLS로 보호됩니다.

3. **데이터베이스 스키마 생성**
   - Supabase 대시보드 → SQL Editor 열기
   - `src/lib/server/db-old/supabase-schema.sql` 파일의 내용 실행 (또는 직접 SQL 작성)
   - 테이블 생성 및 인덱스 생성 확인

### Supabase 클라이언트 사용

#### 서버 전용 클라이언트 및 쿼리 계층
- **클라이언트 위치**: `src/lib/server/supabase/client.ts`
- **쿼리 계층**: `src/lib/server/supabase/queries/posts.ts`
- **용도**: 서버 사이드에서만 사용 (SvelteKit의 `+page.server.ts`, `+layout.server.ts` 등)
- **권장 사용 방법** (쿼리 계층 사용):
  ```typescript
  // ✅ 권장: 쿼리 계층 함수 사용
  import { createPost, listPosts, getPostById } from '$lib/server/supabase/queries/posts';
  
  // 게시글 생성
  const post = await createPost({ title, content, author_name: '작성자' });
  
  // 게시글 목록 조회
  const posts = await listPosts();
  
  // 게시글 상세 조회
  const post = await getPostById(id);
  ```
- **직접 클라이언트 사용** (특수한 경우만):
  ```typescript
  // ⚠️ 특수한 경우만 직접 사용 (일반적으로는 쿼리 계층 사용)
  import { createSupabaseClient } from '$lib/server/supabase/client';
  
  const supabase = createSupabaseClient();
  const { data, error } = await supabase.from('posts').select('*');
  ```

#### 보안 규칙
- ✅ **사용 가능**: `PUBLIC_SUPABASE_ANON_KEY` (RLS로 보호됨)
- ❌ **절대 사용 금지**: `SUPABASE_SERVICE_ROLE_KEY` (클라이언트 노출 시 위험)
- ✅ **서버 전용**: `src/lib/server/supabase/` 디렉토리에서만 클라이언트 생성
- ✅ **쿼리 계층 사용**: 모든 DB 접근은 `queries/posts.ts`의 함수들을 통해서만 수행

### RLS (Row Level Security) 설정

#### MVP 단계 (현재)
- **RLS 비활성화**: 모든 사용자가 읽기/쓰기 가능
- **설정 방법**: Supabase 대시보드 → Authentication → Policies
- **또는 SQL로**:
  ```sql
  ALTER TABLE posts DISABLE ROW LEVEL SECURITY;
  ```

#### 프로덕션 단계 (향후)
- **RLS 활성화**: 보안 정책 설정 필수
- **읽기 정책**: 모든 사용자 읽기 가능
- **쓰기 정책**: 인증된 사용자만 작성 가능
- **수정/삭제 정책**: 작성자만 가능
- **예시 정책**:
  ```sql
  -- RLS 활성화
  ALTER TABLE posts ENABLE ROW LEVEL SECURITY;
  
  -- 읽기 정책
  CREATE POLICY "Anyone can read posts"
  ON posts FOR SELECT
  USING (true);
  
  -- 쓰기 정책 (인증된 사용자만)
  CREATE POLICY "Authenticated users can insert posts"
  ON posts FOR INSERT
  WITH CHECK (auth.role() = 'authenticated');
  ```

### Supabase 스키마 구조

#### posts 테이블
```sql
CREATE TABLE posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  author_name TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

#### 주요 차이점 (PostgreSQL vs Supabase)
- **ID 타입**: PostgreSQL은 `SERIAL` (정수), Supabase는 `UUID` (문자열)
- **타임스탬프**: Supabase는 `TIMESTAMPTZ` 사용 (타임존 포함)
- **기본값**: `gen_random_uuid()`로 UUID 자동 생성

### 마이그레이션 가이드

#### 기존 PostgreSQL 데이터를 Supabase로 이전
1. PostgreSQL에서 데이터 export
2. Supabase SQL Editor에서 스키마 생성
3. 데이터 import (필요시 형식 변환)

#### 향후 마이그레이션
- Supabase 대시보드의 Migration 기능 활용
- 또는 SQL Editor에서 직접 실행

### 문제 해결

#### 환경 변수 오류
- **증상**: "Missing Supabase environment variables" 오류
- **해결**: `.env` 파일에 `PUBLIC_SUPABASE_URL`, `PUBLIC_SUPABASE_ANON_KEY` 확인

#### RLS 오류
- **증상**: Insert 실패 (권한 오류)
- **해결**: MVP 단계에서는 RLS 비활성화 확인

#### 타입 오류
- **증상**: ID가 number가 아닌 string
- **해결**: Supabase는 UUID를 사용하므로 string으로 처리

---

## 개발 프로세스 및 문서 업데이트 규칙

### 개발 프로세스
1. **구현**: 기능 개발
2. **테스트**: 구현 완료 후 반드시 테스트 수행 (동작 확인)
3. **문서 업데이트**: 테스트 완료 후 문서 업데이트

### 문서 업데이트 필수 항목
**중요**: 모든 개발 작업 완료 후 이 문서의 다음 섹션들을 반드시 업데이트해야 합니다:
- **현재 단계**: 완료된 작업을 ✅로 표시
- **다음 단계**: 진행 상황에 맞게 우선순위 조정
- **컴포넌트 구조**: 새로 생성된 컴포넌트 추가
- **더미 데이터 구조**: 변경사항 반영

---

**마지막 업데이트**: 2026-01-20 (MVP 3: 게시글 수정/삭제 완료)
