# DROPLY 🟢

> 신진 작가와 Gen Z 컬렉터가 작품을 **발견**하고, 정해진 시간에 **드롭**하며, **경매·정찰제**로 거래하는 힙한 소셜 아트 플랫폼.
> Avant Arte의 발견×드롭 감성 + StockX의 투명 거래 + 슈프림식 한정 드롭.

acid-lime(`#D4FF3F`) × 다크 미니멀, 모바일 우선 PWA. **외부 서비스 키가 하나도 없어도 즉시 구동**됩니다(전부 mock 폴백).

```bash
npm install
npm run dev      # http://localhost:3000 — .env 없이 바로 동작 (mock 모드)
npm test         # 핵심 도메인 로직(정산·멱등·카운트다운) 단위 테스트
npm run build    # 프로덕션 빌드
```

처음 진입 → **로그인** → (소셜 키 미설정 시) 개발용 페르소나로 로그인 → 피드/경매/드롭/등록 체험.

---

## 아키텍처 (확정: 통합 Next.js 풀스택)

스펙의 "운영이 쉽고 간단 + 월 $0~$30" 요구에 맞춰 **단일 Next.js 14 앱**으로 통합했습니다.
(NestJS 분리안 대신 채택 — 배포 1곳, 워커 분리 불필요, 기존 사이드 프로젝트와 동일 패턴)

```
Next.js 14 (App Router) ── Vercel 단독 배포
 ├─ app/(routes)        피드 · 상세 · 경매 · 드롭 · 채팅 · 프로필 · 등록
 ├─ app/actions/*       Server Actions (멱등 주문 · 사기조회 · 인증)
 ├─ lib/data            데이터 접근 (현재 mock → DATABASE_URL 연결 시 Prisma)
 ├─ lib/redis           Upstash REST (미설정 시 in-memory 폴백)
 ├─ lib/fee             정산 계산 (정가·경매 8% / 직거래 0%)
 └─ lib/idempotency     멱등 처리 (Redis + 요청해시)

DB: Neon(Postgres) · Redis: Upstash · 미디어: Cloudflare R2(egress 무료)
큐: Upstash QStash / Vercel Cron (경매 마감·알림·정산 — Phase 3+)
```

**저비용 핵심**: R2로 이미지 egress 0원 · 서버리스 DB/Redis 무료티어 · Vercel Hobby → 초기 고정비 **$0~$20/월**.

---

## 구현 범위 (Phase 0–7 전체) ✅

- **Phase 0 — 기반**: Next 14 + TS + Tailwind 디자인 시스템(시안 토큰 포팅), 전체 Prisma 스키마, OAuth 어댑터(카카오·Google·Apple, 키 있을 때만 노출) + 개발용 로그인, PWA.
- **Phase 1 — 발견 & 작품**: 무한 피드(5개 필터), 작품 상세(캐러셀·거래 히스토리·스펙·**인증샷 OG 자동 생성**), 작가 프로필(통계·탭·**리뷰 평점**·실효 신뢰도), 작품 등록 4단계 위저드, 좋아요·팔로우·위시리스트.
- **Phase 2 — 정찰제 거래**: **멱등 주문** + 토스페이먼츠 어댑터(mock 폴백) 결제 승인 + 8% 정산, 주문 내역, 수령 확정, 구매 후 **리뷰→trustScore**.
- **Phase 3 — 경매**: 서버 권위 입찰 = **분산락 + 낙관적 락(version) + 멱등 + 최소호가 + 앤티스나이핑 연장 + 추월 알림**, 낙찰/유찰(reserve) 마감, 경량 폴링 라이브(WS 상시가동 대비 운영비 0).
- **Phase 4 — 드롭**: **원자 재고 차감(오버셀 0)** + 1인 한정 + 멱등 + 가상 웨이팅룸, 라이브 재고 폴링.
- **Phase 5 — 채팅 직거래 & 사기방지**: 메시지 서버 영속, **계좌/번호 사기이력 조회(SHA-256 해시 저장)**, 신고 기능, **어드민 모더레이션 큐**, trustScore.
- **Phase 6 — 소셜 & 알림**: 이벤트 알림 스토어(입찰추월/낙찰/판매/메시지/리뷰), 읽음 처리, **Web Push 옵트인**, Resend 이메일 어댑터(mock), OG 공유카드, 거래 히스토리, 검색.
- **Phase 7 — 하드닝**: `/api/health`(어댑터 상태), 레이트리밋(입찰/구매), 동시성·오버셀·멱등 **통합 테스트**.
- **사업 모델**: 정가·경매 8% 수수료, 직거래 0% — 정산/등록/주문에 반영.

**테스트 34 passing**: 정산·멱등·카운트다운 유틸 + 경매(동시 입찰 직렬화·앤티스나이핑·낙찰) + 드롭(오버셀 0·1인 한정) + 주문(멱등·정산).

### 주요 라우트
화면: `/` `/search` `/notifications` `/me` `/me/orders` `/@handle` `/art/[id]` `/auction/[id]` `/drop/[id]` `/chat/[id]` `/new` `/login` `/onboarding` `/admin`
API: `/api/health` · `/api/auction/[id]`(폴링) · `/api/drop/[id]`(폴링) · `/api/push/subscribe`

### 운영비/관리 효율 설계
- 실시간을 **경량 폴링 + Redis 원자연산**으로 → 상시 WS 서버 불필요(고정비 0).
- 모든 외부 의존을 **어댑터 + mock 폴백**으로 → 키 없이도 전 기능 동작, 운영 전환은 env만 채우면 됨.
- `/api/health`로 현재 어댑터(mock/실서비스) 가시화.

---

## 운영 전환 체크리스트 (env 채우면 자동 활성)

`.env.example` 참고. 키를 채우는 즉시 해당 기능이 mock → 실서비스로 전환됩니다.

| 변수 | 효과 |
|---|---|
| `DATABASE_URL` (Neon) | mock → Prisma 실 DB. `npm run prisma:push && npm run seed` |
| `KAKAO/GOOGLE/APPLE_*` | 개발 로그인 → 실제 소셜 OAuth 버튼 노출 |
| `UPSTASH_REDIS_REST_*` | in-memory → 분산 멱등·락·레이트리밋 |
| `R2_*` | 외부 URL → R2 업로드(egress 무료) |
| `TOSS_*` | 정가 구매 주문 → 토스페이먼츠 실결제 (Phase 2) |
| `THECHEAT_API_KEY` | 자체 mock → 더치트 실시간 사기조회 (Phase 5) |

## 배포 (Vercel)

```bash
vercel            # 프리뷰
vercel --prod     # 프로덕션
```
환경변수는 Vercel 대시보드 또는 `vercel env`로 주입. Neon·Upstash·R2는 Vercel Marketplace에서 연동 가능.

## 다음 로드맵
- **Phase 2** 토스페이먼츠 실결제 + 정산 큐  ·  **Phase 3** 경매 실시간 WS + 분산락/낙관적락 + BullMQ/QStash 마감
- **Phase 4** 드롭 Redis Lua 원자 재고  ·  **Phase 5** 채팅 영속 + trustScore/모더레이션  ·  **Phase 6** Web Push/이메일·검색·리뷰
