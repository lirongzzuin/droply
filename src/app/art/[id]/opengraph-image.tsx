import { ImageResponse } from "next/og";
import { getArtwork } from "@/lib/data";
import { formatKRW } from "@/lib/utils";
import { SALE_TYPE_LABEL } from "@/lib/constants";

export const runtime = "nodejs";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
export const alt = "DROPLY 작품";

/** 인증샷용 OG 카드 자동 생성 — 인스타/틱톡 공유 유도 */
export default async function Og({ params }: { params: { id: string } }) {
  const art = await getArtwork(params.id);
  const title = art?.title ?? "DROPLY";
  const artist = art?.artist.displayName ?? "";
  const price = art ? formatKRW(art.displayPrice) : "";
  const kind = art ? SALE_TYPE_LABEL[art.saleType] : "";
  const img = art?.images[0];

  return new ImageResponse(
    (
      <div style={{ display: "flex", width: "100%", height: "100%", background: "#131313", color: "#fff", fontFamily: "sans-serif" }}>
        {img && (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={img} alt="" width={520} height={630} style={{ objectFit: "cover" }} />
        )}
        <div style={{ display: "flex", flexDirection: "column", justifyContent: "space-between", padding: 64, flex: 1 }}>
          <div style={{ display: "flex", fontSize: 30, letterSpacing: 4, color: "#D4FF3F", fontWeight: 800 }}>DROPLY</div>
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <div style={{ display: "flex", fontSize: 26, color: "#c6c6c7" }}>{kind} · @{art?.artist.handle ?? ""}</div>
            <div style={{ display: "flex", fontSize: 64, fontWeight: 800, lineHeight: 1.05 }}>{title}</div>
            <div style={{ display: "flex", fontSize: 30, color: "#c6c6c7" }}>{artist}</div>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
            <div style={{ display: "flex", background: "#D4FF3F", color: "#000", padding: "14px 28px", borderRadius: 10, fontSize: 36, fontWeight: 700 }}>
              {price}
            </div>
          </div>
        </div>
      </div>
    ),
    size,
  );
}
