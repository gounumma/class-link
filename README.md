# 클래스모아 MVP

학생과 관리자를 위한 한국어 과외 수업 문의 플랫폼입니다. Next.js 15 App Router, TypeScript, Tailwind CSS, Supabase Auth/PostgreSQL로 구성했습니다.

## 주요 기능

- 공개 수업 목록, 검색, 상세 페이지
- 학생 회원가입과 이메일 로그인
- 학생과 관리자 사이의 1:1 수업 문의
- 관리자 수업 CRUD·공개 관리, 전체 문의 답변
- 관리자가 기획한 수업을 홈 ‘지금 만나볼 수 있는 수업’ 추천 영역에 선택 노출
- Zod 서버 검증, 역할 기반 서버 권한 검사, Supabase RLS
- 한국어 이용약관·개인정보처리방침 초안

Supabase 환경 변수가 없으면 샘플 데이터가 표시되는 **로컬 데모 모드**로 실행됩니다. 배포 환경에서는 환경 변수를 반드시 설정하며, 데모 권한 우회는 환경 변수가 설정되는 즉시 비활성화됩니다.

## 1. Supabase 프로젝트 설정

1. [Supabase](https://supabase.com)에서 새 프로젝트를 만듭니다.
2. SQL Editor에서 `supabase/migrations` 폴더의 SQL을 파일명 순서대로 실행합니다.
3. 샘플 수업이 필요하면 `supabase/seed.sql`을 실행합니다.
4. Authentication → Providers에서 Email을 활성화합니다.
5. Authentication → URL Configuration에 로컬 `http://localhost:3000/**`와 실제 배포 URL을 Redirect URL로 추가합니다.
6. 기본 확인 링크 방식은 `/auth/callback`에서 처리합니다. Supabase 이메일 템플릿에서 Token Hash 방식을 사용할 경우 확인 링크를 아래처럼 설정합니다.

```html
<a href="{{ .SiteURL }}/auth/confirm?token_hash={{ .TokenHash }}&type=email&next=/dashboard">이메일 인증</a>
```

마이그레이션이 다음을 함께 설정합니다.

- 6개 업무 테이블, 인덱스, `updated_at` 트리거
- 신규 Auth 사용자의 프로필 자동 생성 트리거
- 역할별 Row Level Security 정책
- 서버 액션과 DB 트리거의 2초 메시지 연속 전송 제한

> 가입 메타데이터로 `ADMIN` 역할을 만들 수 없도록 DB 트리거가 `STUDENT` 또는 `TUTOR`만 허용합니다.

## 2. 환경 변수

`.env.example`을 `.env.local`로 복사하고 값을 채웁니다.

```bash
NEXT_PUBLIC_SUPABASE_URL=https://YOUR_PROJECT.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=YOUR_ANON_KEY
SUPABASE_SERVICE_ROLE_KEY=YOUR_SERVICE_ROLE_KEY
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

`SUPABASE_SERVICE_ROLE_KEY`는 서버 전용 관리 작업에 사용하는 키입니다. 브라우저에 노출하거나 `NEXT_PUBLIC_` 접두사를 붙이지 마세요.

## 3. 첫 관리자 만들기

1. 앱의 학생 회원가입으로 관리자용 계정을 하나 만들고 이메일 인증을 완료합니다.
2. Supabase SQL Editor에서 아래 SQL을 실행합니다. 이메일은 실제 관리자 계정으로 바꿉니다.

```sql
update public.users_profile
set role = 'ADMIN', tutor_status = null
where email = 'admin@example.com';
```

로그아웃 후 다시 로그인하면 `/admin`에 접근할 수 있습니다. 관리자 역할은 공개 회원가입이나 클라이언트 코드에서 부여할 수 없습니다.

## 4. 로컬 실행

Node.js 20 이상과 pnpm 11을 사용합니다.

```bash
corepack enable
pnpm install
pnpm dev
```

브라우저에서 `http://localhost:3000`을 엽니다.

검증 명령:

```bash
pnpm typecheck
pnpm lint
pnpm build
```

`GET /api/health`는 배포 상태 확인용 JSON을 반환합니다. Supabase 연결 상태가 비정상이면 HTTP 503을 반환하므로 Vercel 외부 모니터링의 상태 확인 URL로 사용할 수 있습니다.

GitHub에 푸시하면 `.github/workflows/ci.yml`이 타입 검사, 린트, 프로덕션 빌드를 자동 실행합니다.

## 5. Vercel 배포

1. 저장소를 GitHub 등에 푸시하고 Vercel에서 Import합니다.
2. Framework Preset은 Next.js로 둡니다.
3. 위 4개 환경 변수를 Production/Preview에 등록합니다. `NEXT_PUBLIC_SITE_URL`은 실제 HTTPS 도메인으로 바꿉니다.
4. 배포 후 실제 도메인을 Supabase Authentication Redirect URL에 추가합니다.
5. 회원가입, 이메일 인증, 튜터 파일 업로드, 관리자 승인, 양방향 메시지를 실제 계정으로 점검합니다.

## 운영 전 체크리스트

- 법적 문서와 푸터의 `[상호명]`, 대표자, 사업자등록번호, 주소, 연락처, 개인정보 보호책임자 정보를 확정
- 만 14세 미만 회원을 받을 경우 법정대리인 동의 절차 별도 구현
- 이메일 발송 도메인과 템플릿 설정
- 관리자 계정 MFA와 운영자 최소 권한 적용
- 오류 추적, 감사 로그, 백업·복구 절차 설정
- 실제 결제를 도입할 경우 전자상거래 고지와 결제사 연동 별도 검토

## 디렉터리

```text
app/                  라우트, 페이지, 서버 액션
components/           공통 UI와 업무 화면 컴포넌트
lib/                  Supabase, 인증, 검증, 데이터 접근
supabase/migrations/  DB·RLS·Storage 마이그레이션
supabase/seed.sql      샘플 수업 데이터
```
