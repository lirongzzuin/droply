/**
 * DB 시드 — DATABASE_URL 연결 후 `npm run seed` 로 mock 데이터를 실제 테이블에 적재.
 * (DATABASE_URL 미설정 시 앱은 mock으로 동작하므로 시드 없이도 구동된다.)
 */
import { PrismaClient } from "@prisma/client";
import { ARTISTS } from "../src/lib/mock/data";

const prisma = new PrismaClient();

async function main() {
  for (const a of ARTISTS) {
    await prisma.user.upsert({
      where: { handle: a.handle },
      update: {},
      create: {
        email: `${a.handle}@droply.demo`,
        handle: a.handle,
        displayName: a.displayName,
        avatarUrl: a.avatarUrl,
        bio: a.bio,
        oauthProvider: "dev",
        oauthSub: a.id,
        isArtist: true,
        isVerified: a.isVerified,
        trustScore: a.trustScore,
        artistProfile: {
          create: {
            statement: a.statement ?? "",
            coverUrl: a.coverUrl,
            socials: a.socials ?? {},
            isTopArtist: a.isTopArtist ?? false,
          },
        },
      },
    });
  }
  console.log(`seeded ${ARTISTS.length} artists`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
