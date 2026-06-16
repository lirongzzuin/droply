/**
 * DB 시드 — mock 콘텐츠를 실제 Neon 테이블에 적재 (멱등: 데모 데이터 재생성).
 * `npm run seed` (DATABASE_URL 필요). 운영 데이터는 oauthProvider!=='dev' 라 보존된다.
 */
import { PrismaClient, SaleType, ArtworkStatus, AuctionStatus } from "@prisma/client";
import { ARTISTS, ARTWORKS } from "../src/lib/mock/data";
import { DEV_PERSONAS } from "../src/lib/auth";

const prisma = new PrismaClient();

async function main() {
  // 1) 데모(dev) 데이터 초기화 — 의존성 역순
  await prisma.bid.deleteMany({});
  await prisma.auction.deleteMany({});
  await prisma.dropItem.deleteMany({});
  await prisma.artworkImage.deleteMany({});
  await prisma.artwork.deleteMany({});
  await prisma.artistProfile.deleteMany({});
  await prisma.user.deleteMany({ where: { oauthProvider: "dev" } });

  // 2) 사용자 — 작가 + 데모 페르소나 + 경매 입찰자
  const artistUsers = ARTISTS.map((a) => ({
    id: a.id,
    email: `${a.handle}@droply.demo`,
    handle: a.handle,
    displayName: a.displayName,
    avatarUrl: a.avatarUrl,
    bio: a.bio,
    isArtist: true,
    isVerified: a.isVerified,
    trustScore: a.trustScore,
  }));

  const personaUsers = DEV_PERSONAS.filter((p) => !ARTISTS.some((a) => a.id === p.id)).map((p) => ({
    id: p.id,
    email: `${p.handle}@droply.demo`,
    handle: p.handle,
    displayName: p.displayName,
    avatarUrl: p.avatarUrl,
    isArtist: p.isArtist,
    isVerified: p.isVerified,
    trustScore: p.trustScore,
  }));

  // 경매 입찰자(핸들만 있는 mock) → 경량 유저 생성
  const bidderHandles = new Set<string>();
  for (const aw of ARTWORKS) aw.auction?.bids.forEach((b) => bidderHandles.add(b.bidderHandle));
  const known = new Set([...ARTISTS.map((a) => a.handle), ...DEV_PERSONAS.map((p) => p.handle)]);
  const bidderUsers = [...bidderHandles]
    .filter((h) => !known.has(h))
    .map((h) => ({
      id: `u_${h}`,
      email: `${h}@droply.demo`,
      handle: h,
      displayName: h,
      avatarUrl: `https://picsum.photos/seed/${h}-ava/200/200`,
      isArtist: false,
      trustScore: 50,
    }));

  for (const u of [...artistUsers, ...personaUsers, ...bidderUsers]) {
    await prisma.user.create({ data: { ...u, oauthProvider: "dev", oauthSub: u.id } });
  }

  // 3) 작가 프로필
  for (const a of ARTISTS) {
    await prisma.artistProfile.create({
      data: {
        userId: a.id,
        statement: a.statement ?? "",
        coverUrl: a.coverUrl,
        socials: a.socials ?? {},
        isTopArtist: a.isTopArtist ?? false,
      },
    });
  }

  // 4) 작품 + 이미지 + 경매(+입찰) + 드롭
  const handleToId = new Map<string, string>([
    ...ARTISTS.map((a) => [a.handle, a.id] as [string, string]),
    ...DEV_PERSONAS.map((p) => [p.handle, p.id] as [string, string]),
    ...bidderUsers.map((b) => [b.handle, b.id] as [string, string]),
  ]);

  for (const aw of ARTWORKS) {
    await prisma.artwork.create({
      data: {
        id: aw.id,
        artistId: aw.artist.id,
        title: aw.title,
        description: aw.description,
        medium: aw.medium,
        edition: aw.edition,
        saleType: aw.saleType as SaleType,
        status: aw.status as ArtworkStatus,
        tags: aw.tags,
        fixedPrice: aw.fixedPrice,
        allowPg: aw.allowPg,
        allowDirect: aw.allowDirect,
        likeCount: aw.likeCount,
        viewCount: aw.viewCount,
        createdAt: new Date(aw.createdAt),
        images: { create: aw.images.map((url, i) => ({ url, position: i })) },
      },
    });

    if (aw.auction) {
      const auction = await prisma.auction.create({
        data: {
          artworkId: aw.id,
          startPrice: aw.auction.startPrice,
          minIncrement: aw.auction.minIncrement,
          reservePrice: aw.auction.reservePrice,
          startsAt: new Date(aw.auction.startsAt),
          endsAt: new Date(aw.auction.endsAt),
          status: aw.auction.status as AuctionStatus,
          antiSnipeSec: aw.auction.antiSnipeSec,
        },
      });
      // 입찰 기록 (오래된 → 최신 순으로 생성)
      const ordered = [...aw.auction.bids].reverse();
      for (let i = 0; i < ordered.length; i++) {
        const b = ordered[i];
        await prisma.bid.create({
          data: {
            auctionId: auction.id,
            bidderId: handleToId.get(b.bidderHandle) ?? `u_${b.bidderHandle}`,
            amount: b.amount,
            idempotencyKey: `seed_${aw.id}_${i}`,
            createdAt: new Date(b.createdAt),
          },
        });
      }
      const top = aw.auction.bids[0];
      if (top) await prisma.auction.update({ where: { id: auction.id }, data: { highBidId: top.id } });
    }

    if (aw.drop) {
      await prisma.dropItem.create({
        data: {
          artworkId: aw.id,
          dropAt: new Date(aw.drop.dropAt),
          totalStock: aw.drop.totalStock,
          soldStock: aw.drop.soldStock,
          perUserLimit: aw.drop.perUserLimit,
        },
      });
    }
  }

  // 5) 데모 팔로우 (카운트가 0이 아니게 — 페르소나가 작가 팔로우)
  for (const p of DEV_PERSONAS) {
    for (const a of ARTISTS) {
      if (p.id === a.id) continue;
      await prisma.follow.create({ data: { followerId: p.id, followingId: a.id } }).catch(() => {});
    }
  }

  const counts = {
    users: await prisma.user.count(),
    artworks: await prisma.artwork.count(),
    auctions: await prisma.auction.count(),
    drops: await prisma.dropItem.count(),
  };
  console.log("seeded:", counts);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
