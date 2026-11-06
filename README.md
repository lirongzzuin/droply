# DROPLY

> 신진 작가의 작품을 발견하고, 정해진 시간에 한정 수량으로 "드롭"하며, 경매·정가로 거래하는 소셜 아트 플랫폼 프로토타입

![Next.js](https://img.shields.io/badge/Next.js-14-000000?logo=nextdotjs)
![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?logo=typescript&logoColor=white)
![Prisma](https://img.shields.io/badge/Prisma-Neon_Postgres-2D3748?logo=prisma)
![Upstash](https://img.shields.io/badge/Upstash-Redis-00E9A3?logo=upstash&logoColor=white)
![PortOne](https://img.shields.io/badge/PortOne-V2-1E64FF)
![Vitest](https://img.shields.io/badge/Vitest-38_tests-6E9F18?logo=vitest&logoColor=white)

**상태: 프로토타입.** 화면과 핵심 거래 로직은 동작하지만, 경매·드롭·주문 같은 쓰기 상태는 아직 서버 메모리(단일 인스턴스)에 있습니다.
작품·작가 등 콘텐츠 읽기는 `DATABASE_URL` 이 있으면 Prisma(Neon)로, 없으면 mock 데이터로 동작합니다.

---

## 무엇을 해결하나

한정판 아트 거래에서 문제가 되는 건 "동시에 몰리는 요청"입니다.

- 경매 마감 직전 여러 명이 동시에 입찰해도 **입찰이 한 줄로 처리**되어야 하고
- 한정 수량 드롭에서 **재고보다 많이 팔리면(오버셀) 안 되며**
- 네트워크 재시도로 같은 요청이 두 번 와도 **주문·입찰이 한 번만** 생겨야 합니다.

DROPLY 는 이 세 가지를 서비스 계층에서 보장하고, 외부 서비스 키가 하나도 없어도 전 기능이 mock 으로 돌아가도록 설계했습니다.

## 아키텍처

단일 Next.js 14(App Router) 앱으로 화면·Server Actions·API 를 모두 처리합니다 (Vercel 배포 기준).

```
src/
├── app/                 피드 · 작품 상세 · 경매 · 드롭 · 채팅 · 프로필 · 등록 · 관리자 · 약관
│   ├── actions/         Server Actions (주문 · 입찰 · 드롭 구매 · 결제 확인 · 사기 조회 · 신고)
│   └── api/             health · 경매/드롭 폴링 · Web Push 구독 · PortOne 웹훅
├── lib/
│   ├── services/        auction · drop · order · chat · notifications · moderation (+ 테스트)
│   ├── idempotency.ts   멱등 키 + 요청 해시 (24시간)
│   ├── lock.ts          분산락 (Upstash SET NX EX / in-memory)
│   ├── fee.ts           정산 (정가·경매 수수료 8%, 직거래 0%)
│   ├── payments/        PortOne V2 서버 검증 · 채널 설정
│   └── data.ts          콘텐츠 읽기 (Prisma ↔ mock 폴백)
prisma/schema.prisma     모델 16개 + seed
```

외부 의존성은 모두 "어댑터 + mock 폴백" 구조입니다.

| 기능 | 실서비스 | 키가 없을 때 |
|------|---------|-------------|
| DB | Neon(Postgres) + Prisma | mock 데이터 |
| 락·멱등·레이트리밋 | Upstash Redis REST | in-memory |
| 결제·본인인증 | PortOne V2 (카드·간편결제·가상계좌, 다날 본인인증) | mock 결제 |
| 로그인 | NextAuth (카카오·Google·Apple) | 개발용 페르소나 로그인 |
| 이메일 / 푸시 | Resend / Web Push(VAPID) | 콘솔 로그 / 권한 요청까지만 |

`/api/health` 가 현재 어떤 어댑터가 실서비스·mock 인지 보여 줍니다.

## 기술적으로 집중한 문제

### 1. 경매 동시 입찰
- **문제**: 마감 직전 동시 입찰이 몰리면 최고가 판정이 꼬이고, 마감 직전 입찰(스나이핑)로 다른 참여자가 대응할 시간이 없습니다.
- **해결**: 입찰을 분산락 안에서 처리하고, 경매 상태에 `version` 을 두어 낙관적 락으로 한 번 더 검증합니다. 최소 호가 단위를 강제하고, 마감 `antiSnipeSec` 이내 입찰이면 마감을 연장하며, 추월당한 입찰자에게 알림을 남깁니다. 같은 멱등 키로 다시 온 입찰은 최초 결과를 돌려줍니다.
- **결과**: 동시 입찰 직렬화·연장·낙찰/유찰을 `auction.test.ts` 로 검증합니다.

### 2. 한정 드롭 오버셀 방지
- **문제**: 재고 확인과 차감 사이에 다른 요청이 끼어들면 재고보다 많이 팔립니다.
- **해결**: 락 안에서 "재고 확인 → 1인 구매 한도 확인 → 차감"을 한 번에 수행하고, 구매 요청에 멱등 키를 적용했습니다. 가상 웨이팅룸 UI 와 재고 폴링을 붙였습니다.
- **결과**: 동시 구매 시 판매 수량이 재고를 넘지 않는 것과 1인 한도를 `drop.test.ts` 로 검증합니다.

### 3. 결제 신뢰 경계
- **문제**: 클라이언트나 웹훅이 보낸 결제 결과를 그대로 믿으면 금액 위·변조나 중복 주문이 생깁니다.
- **해결**: 결제 후 클라이언트는 `paymentId` 만 서버에 전달하고, 서버가 PortOne API 로 금액·상태를 재조회해 검증한 뒤 `paymentId` 를 멱등 키로 주문을 만듭니다. 웹훅도 본문 대신 `paymentId` 로 재조회합니다(가상계좌 입금 완료 처리).
- **결과**: 같은 멱등 키로 다시 요청해도 주문이 중복 생성되지 않는 것, 금액 불일치·실패/취소 상태 결제를 거부하는 것을 `order.test.ts`, `portone.test.ts` 로 검증합니다. (주문이 아직 메모리에 있어 웹훅 처리는 best-effort 입니다.)

### 4. 운영비를 늘리지 않는 실시간
- 상시 WebSocket 서버 대신 경량 폴링(`/api/auction/[id]`, `/api/drop/[id]`)과 Redis 원자 연산을 써서 서버리스 환경에서 고정비 없이 동작하게 했습니다.

### 5. 개인정보 최소 보관
- 직거래 전 계좌·전화번호 사기 이력 조회는 입력값을 SHA-256 해시로만 저장·조회합니다 (`app/actions/fraud.ts`).

## 그 밖에 구현한 것

무한 피드(필터 5종), 작품 상세(캐러셀·거래 히스토리·OG 이미지 자동 생성), 작가 프로필·리뷰·신뢰도 점수, 4단계 작품 등록 위저드, 좋아요·팔로우·위시리스트, 채팅 직거래·신고·관리자 모더레이션 큐, 알림, 라이트/다크 테마, PWA(서비스워커·설치·푸시 옵트인), 통신판매 표시 사항(사업자 정보 푸터·약관·개인정보처리방침·환불 정책).

## 품질 / 테스트

```bash
npm test     # Vitest — 7개 파일, 38개 테스트
```

- 정산·멱등·카운트다운 유틸, 경매(동시 입찰·앤티스나이핑·낙찰), 드롭(오버셀·1인 한도), 주문(멱등·정산), PortOne 검증
- `tsc --noEmit`, `next build` 통과 확인

## 실행 방법

```bash
npm install
npm run dev        # http://localhost:3000 — .env 없이 mock 모드로 바로 동작
npm test
npm run build
```

로그인 화면에서 소셜 키가 없으면 개발용 페르소나로 로그인해 피드·경매·드롭·등록을 체험할 수 있습니다.

실 DB 를 쓰려면:

```bash
cp .env.example .env     # DATABASE_URL 등 입력
npm run prisma:push
npm run seed
```

## 설정

모든 변수는 `.env.example` 에 설명과 함께 있습니다. 비워 두면 해당 기능은 mock 으로 동작합니다.

| 변수 | 효과 |
|------|------|
| `DATABASE_URL` | mock → Prisma(Neon) |
| `AUTH_SECRET`, `KAKAO_*` / `GOOGLE_*` / `APPLE_*` | 소셜 로그인 활성화 |
| `UPSTASH_REDIS_REST_*` | in-memory → 분산 락·멱등·레이트리밋 |
| `NEXT_PUBLIC_PORTONE_*`, `PORTONE_API_SECRET` | mock 결제 → PortOne 실결제·본인인증 |
| `NEXT_PUBLIC_VAPID_PUBLIC_KEY`, `VAPID_PRIVATE_KEY` | Web Push 발송 |
| `NEXT_PUBLIC_BIZ_*` | 푸터·약관에 표시할 사업자 정보 |

## 개발 방식

[Claude Code](https://claude.com/claude-code) 와 함께 설계·구현했습니다 (커밋의 `Co-Authored-By` 참고).
