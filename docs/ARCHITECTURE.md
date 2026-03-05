# Artful 기술 아키텍처 상세

## 1. 시스템 아키텍처

```
[Client Layer]
    Browser / Mobile WebView
         │
         ▼
[Presentation Layer]
    Next.js (React + TypeScript)
    ├── Pages (SSR/SSG)
    ├── Components (Tailwind CSS)
    └── State Management (Zustand)
         │
         ▼
[API Layer]
    Next.js API Routes
    ├── Auth (NextAuth.js)
    ├── REST API (CRUD)
    ├── Analytics API
    └── AI Analysis API
         │
         ▼
[Data Layer]
    PostgreSQL (Supabase)
    ├── Prisma ORM
    ├── Supabase Storage (이미지/영상)
    └── Supabase Realtime (알림)
         │
         ▼
[External Services]
    ├── Kakao OAuth
    ├── OpenAI API (AI 코칭)
    ├── QR Code Generator
    └── Email Service (Resend)
```

## 2. 데이터베이스 스키마 (PostgreSQL)

```sql
-- 사용자 (예술인)
CREATE TABLE users (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email         VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255),
  display_name  VARCHAR(100) NOT NULL,
  bio           TEXT,
  photo_url     TEXT,
  genres        TEXT[],
  role          VARCHAR(20) DEFAULT 'free',  -- free / pro
  created_at    TIMESTAMPTZ DEFAULT NOW(),
  updated_at    TIMESTAMPTZ DEFAULT NOW()
);

-- 포트폴리오
CREATE TABLE portfolios (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID REFERENCES users(id) ON DELETE CASCADE,
  title       VARCHAR(255) NOT NULL,
  description TEXT,
  category    VARCHAR(50),
  is_public   BOOLEAN DEFAULT true,
  created_at  TIMESTAMPTZ DEFAULT NOW(),
  updated_at  TIMESTAMPTZ DEFAULT NOW()
);

-- 포트폴리오 아이템 (작품)
CREATE TABLE portfolio_items (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  portfolio_id UUID REFERENCES portfolios(id) ON DELETE CASCADE,
  type         VARCHAR(20) NOT NULL,  -- image / video / link / document
  title        VARCHAR(255),
  description  TEXT,
  media_url    TEXT,
  sort_order   INT DEFAULT 0,
  created_at   TIMESTAMPTZ DEFAULT NOW()
);

-- 이력/크레딧
CREATE TABLE credits (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID REFERENCES users(id) ON DELETE CASCADE,
  title       VARCHAR(255) NOT NULL,
  role        VARCHAR(100),
  year        INT,
  description TEXT,
  verified    BOOLEAN DEFAULT false,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

-- 공유 링크
CREATE TABLE share_links (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id      UUID REFERENCES users(id) ON DELETE CASCADE,
  slug         VARCHAR(50) UNIQUE NOT NULL,
  portfolio_ids UUID[],
  expires_at   TIMESTAMPTZ,
  view_count   INT DEFAULT 0,
  created_at   TIMESTAMPTZ DEFAULT NOW()
);

-- 열람 분석
CREATE TABLE view_analytics (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  share_link_id UUID REFERENCES share_links(id),
  viewer_ip    VARCHAR(45),
  user_agent   TEXT,
  scroll_depth JSONB,       -- 섹션별 스크롤 깊이
  duration_ms  INT,
  sections     JSONB,       -- 각 섹션 체류시간
  created_at   TIMESTAMPTZ DEFAULT NOW()
);

-- 팔로우
CREATE TABLE follows (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  follower_id  UUID REFERENCES users(id) ON DELETE CASCADE,
  following_id UUID REFERENCES users(id) ON DELETE CASCADE,
  created_at   TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(follower_id, following_id)
);

-- 피드 포스트
CREATE TABLE posts (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id    UUID REFERENCES users(id) ON DELETE CASCADE,
  content    TEXT,
  media_urls TEXT[],
  likes      INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 응원 (팁/후원)
CREATE TABLE tips (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sender_id   UUID REFERENCES users(id),
  receiver_id UUID REFERENCES users(id),
  amount      DECIMAL(10,2),
  message     TEXT,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);
```

## 3. API 엔드포인트 설계

### Auth
| Method | Endpoint | 설명 |
|--------|----------|------|
| POST | /api/auth/register | 회원가입 |
| POST | /api/auth/login | 로그인 |
| POST | /api/auth/kakao | 카카오 로그인 |
| GET  | /api/auth/me | 현재 유저 정보 |

### Portfolio
| Method | Endpoint | 설명 |
|--------|----------|------|
| GET | /api/portfolios | 포트폴리오 목록 |
| POST | /api/portfolios | 포트폴리오 생성 |
| PUT | /api/portfolios/:id | 수정 |
| DELETE | /api/portfolios/:id | 삭제 |
| POST | /api/portfolios/:id/items | 아이템 추가 |

### Feed
| Method | Endpoint | 설명 |
|--------|----------|------|
| GET | /api/feed | 피드 목록 |
| POST | /api/posts | 포스트 작성 |
| POST | /api/posts/:id/like | 좋아요 |

### Share
| Method | Endpoint | 설명 |
|--------|----------|------|
| POST | /api/share/create | 공유 링크 생성 |
| GET | /api/share/:slug | 공유 링크 조회 |
| POST | /api/share/:slug/analytics | 열람 데이터 전송 |

### Analytics
| Method | Endpoint | 설명 |
|--------|----------|------|
| GET | /api/analytics/overview | 통계 개요 |
| GET | /api/analytics/heatmap/:id | 히트맵 데이터 |
| GET | /api/analytics/ai-coaching | AI 코칭 리포트 |

### Follow
| Method | Endpoint | 설명 |
|--------|----------|------|
| POST | /api/follow/:userId | 팔로우 |
| DELETE | /api/follow/:userId | 언팔로우 |
| GET | /api/followers | 팔로워 목록 |

## 4. 프론트엔드 페이지 구조

```
/                     → 랜딩 (로그인/회원가입)
/feed                 → 메인 피드
/portfolio            → 내 포트폴리오 목록
/portfolio/create     → 포트폴리오 생성
/portfolio/:id        → 포트폴리오 상세
/portfolio/:id/edit   → 포트폴리오 편집
/profile              → 내 프로필
/profile/edit         → 프로필 편집
/analytics            → 열람 분석 대시보드
/share/:slug          → 공유 링크 뷰어 (외부 공개)
/qr                   → QR 코드 생성
/settings             → 설정
/messages             → 메시지
/notifications        → 알림
/search               → 검색
```

## 5. 보안 설계

- JWT 기반 인증 (httpOnly cookie)
- CSRF 보호
- Rate limiting (API)
- 이미지 업로드 시 저작권 확인 프로세스
- 본인 승인 원칙: 타인이 등록한 정보도 본인 승인 필요
- 개인정보 암호화 (AES-256)

## 6. 성능 목표

| 지표 | 목표 |
|------|------|
| 초기 로딩 | < 2초 (LCP) |
| API 응답 | < 200ms |
| 이미지 로딩 | WebP + lazy loading |
| Lighthouse 점수 | > 90 |
