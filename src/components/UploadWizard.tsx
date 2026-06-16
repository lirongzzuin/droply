"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { Icon } from "./Icon";
import { cn, formatKRW } from "@/lib/utils";
import { calcSettlement } from "@/lib/fee";
import { SUGGESTED_TAGS } from "@/lib/constants";

type SaleType = "FIXED" | "AUCTION" | "DROP";
const STEPS = ["이미지 업로드", "작품 정보 입력", "판매 방식 선택", "결제 및 확인"];

interface Img {
  url: string;
  name: string;
}

export function UploadWizard() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [images, setImages] = useState<Img[]>([]);
  const [title, setTitle] = useState("");
  const [desc, setDesc] = useState("");
  const [medium, setMedium] = useState("");
  const [edition, setEdition] = useState("");
  const [tags, setTags] = useState<string[]>([]);
  const [saleType, setSaleType] = useState<SaleType>("FIXED");
  const [price, setPrice] = useState<number>(0);
  const [allowPg, setAllowPg] = useState(true);
  const [allowDirect, setAllowDirect] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);

  const settle = useMemo(() => calcSettlement(price || 0, allowPg ? "PG" : "DIRECT_TRANSFER"), [price, allowPg]);

  function onFiles(files: FileList | null) {
    if (!files) return;
    const next = Array.from(files).slice(0, 8 - images.length).map((f) => ({ url: URL.createObjectURL(f), name: f.name }));
    setImages((prev) => [...prev, ...next]);
  }
  function removeImg(i: number) {
    setImages((prev) => prev.filter((_, idx) => idx !== i));
  }
  function toggleTag(t: string) {
    setTags((prev) => (prev.includes(t) ? prev.filter((x) => x !== t) : prev.length < 5 ? [...prev, t] : prev));
  }

  const canNext =
    (step === 1 && images.length > 0) ||
    (step === 2 && title.trim().length > 0) ||
    (step === 3 && price > 0) ||
    step === 4;

  function next() {
    if (step < 4) {
      setStep((s) => s + 1);
      window.scrollTo({ top: 0, behavior: "smooth" });
    } else {
      submit();
    }
  }
  function prev() {
    if (step > 1) setStep((s) => s - 1);
  }

  async function submit() {
    setSubmitting(true);
    // 데모: R2 업로드 + Artwork 생성은 Phase에서 연결. 여기선 검증 후 성공 처리.
    await new Promise((r) => setTimeout(r, 700));
    setSubmitting(false);
    setDone(true);
  }

  if (done) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-5 text-center px-6">
        <Icon name="check_circle" fill className="text-acid-lime text-6xl" />
        <h2 className="font-display text-headline-md">작품이 등록됐어요!</h2>
        <p className="text-secondary">‘{title || "Untitled"}’ 이(가) {saleType === "FIXED" ? "정가 판매" : saleType === "AUCTION" ? "경매" : "드롭"}으로 리스트에 올라갔습니다.</p>
        <button onClick={() => router.push("/")} className="bg-acid-lime text-black font-bold px-8 py-4 rounded-lg shadow-acid active:scale-95 transition-all">
          피드에서 확인하기
        </button>
      </div>
    );
  }

  return (
    <>
      {/* 진행 표시 */}
      <div className="mb-section-gap">
        <div className="flex justify-between mb-2">
          <span className="font-mono text-label-caps text-acid-lime uppercase">Step {step} / 4</span>
          <span className="font-mono text-label-caps text-secondary uppercase">{STEPS[step - 1]}</span>
        </div>
        <div className="h-1 bg-surface-container-highest w-full rounded-full overflow-hidden">
          <div className="h-full bg-acid-lime transition-all duration-500" style={{ width: `${(step / 4) * 100}%` }} />
        </div>
      </div>

      {step === 1 && (
        <section>
          <h2 className="font-display text-headline-md mb-stack-lg leading-tight">당신의 작품을<br />세상에 보여주세요.</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-gutter">
            <label className="aspect-square bg-surface-container-low border border-dashed border-outline-variant flex flex-col items-center justify-center cursor-pointer hover:border-acid-lime transition-colors group rounded-lg">
              <input type="file" accept="image/*" multiple className="hidden" onChange={(e) => onFiles(e.target.files)} />
              <Icon name="add_a_photo" className="text-4xl mb-2 text-secondary group-hover:text-acid-lime" />
              <span className="font-mono text-[10px] text-secondary">MAX 10MB</span>
            </label>
            {images.map((img, i) => (
              <div key={i} className="aspect-square bg-surface-container overflow-hidden relative group rounded-lg">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={img.url} alt={img.name} className="w-full h-full object-cover" />
                <button onClick={() => removeImg(i)} className="absolute top-2 right-2 p-1 bg-black/50 glass rounded-full text-white">
                  <Icon name="close" className="text-sm" />
                </button>
                {i === 0 && <div className="absolute bottom-0 inset-x-0 bg-acid-lime text-black font-mono text-[10px] text-center py-1">MAIN</div>}
              </div>
            ))}
          </div>
          <p className="mt-stack-md text-secondary text-sm">첫 번째 이미지가 대표 이미지가 됩니다.</p>
        </section>
      )}

      {step === 2 && (
        <section className="space-y-stack-lg">
          <h2 className="font-display text-headline-md mb-2 leading-tight">작품의 가치를<br />설명해주세요.</h2>
          <Field label="제목">
            <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="작품명을 입력하세요" className={inputCls} />
          </Field>
          <Field label="작품 설명">
            <textarea value={desc} onChange={(e) => setDesc(e.target.value)} rows={4} placeholder="작품의 영감, 제작 과정 등" className={cn(inputCls, "resize-none")} />
          </Field>
          <div className="grid grid-cols-2 gap-stack-md">
            <Field label="매체"><input value={medium} onChange={(e) => setMedium(e.target.value)} placeholder="디지털 / 캔버스" className={inputCls} /></Field>
            <Field label="에디션"><input value={edition} onChange={(e) => setEdition(e.target.value)} placeholder="1/1, Open Edition" className={inputCls} /></Field>
          </div>
          <Field label={`태그 (${tags.length}/5)`}>
            <div className="flex flex-wrap gap-2 pt-2">
              {SUGGESTED_TAGS.map((t) => (
                <button key={t} onClick={() => toggleTag(t)} className={cn("px-3 py-1.5 rounded-full font-mono text-xs border transition-colors", tags.includes(t) ? "bg-acid-lime text-black border-acid-lime" : "bg-surface-container text-secondary border-outline-variant")}>
                  #{t}
                </button>
              ))}
            </div>
          </Field>
        </section>
      )}

      {step === 3 && (
        <section>
          <h2 className="font-display text-headline-md mb-stack-lg">판매 방식 선택</h2>
          <div className="space-y-stack-md">
            <SaleCard active={saleType === "FIXED"} onClick={() => setSaleType("FIXED")} icon="sell" title="정가 판매" desc="구매자가 즉시 결제하여 소장합니다.">
              <PriceInput label="판매가 (KRW)" value={price} onChange={setPrice} />
            </SaleCard>
            <SaleCard active={saleType === "AUCTION"} onClick={() => setSaleType("AUCTION")} icon="gavel" title="경매" desc="최고가 입찰자에게 낙찰됩니다.">
              <PriceInput label="시작가 (KRW)" value={price} onChange={setPrice} />
            </SaleCard>
            <SaleCard active={saleType === "DROP"} onClick={() => setSaleType("DROP")} icon="schedule" title="드롭 (DROP)" desc="특정 시간에 한정 수량을 선착순 판매합니다.">
              <PriceInput label="드롭 가격 (KRW)" value={price} onChange={setPrice} />
            </SaleCard>
          </div>
        </section>
      )}

      {step === 4 && (
        <section>
          <h2 className="font-display text-headline-md mb-stack-lg">결제 방식 설정</h2>
          <div className="space-y-stack-md">
            <PayToggle on={allowPg} onToggle={() => setAllowPg((v) => !v)} title="온라인 결제 (토스페이먼츠)" sub={`카드·가상계좌 · 플랫폼 수수료 8%`} badge="토스" />
            <PayToggle on={allowDirect} onToggle={() => setAllowDirect((v) => !v)} title="채팅 직거래 (계좌이체)" sub="수수료 없음 · 채팅으로 협의" icon="chat" />

            <div className="mt-section-gap p-stack-md bg-acid-lime/5 border border-acid-lime/20 rounded-xl space-y-1">
              <p className="text-acid-lime font-mono text-label-caps mb-2">FINAL REVIEW</p>
              <Row label="작품명" value={title || "Untitled"} />
              <Row label="판매 방식" value={saleType === "FIXED" ? "정가 판매" : saleType === "AUCTION" ? "경매" : "드롭"} />
              <Row label="가격" value={formatKRW(price)} />
              {allowPg && <Row label="플랫폼 수수료 (8%)" value={`- ${formatKRW(settle.feeAmount)}`} />}
              <div className="flex justify-between items-center pt-2 border-t border-outline-variant mt-2">
                <span className="text-secondary text-sm">수수료 제외 정산 예정액</span>
                <span className="text-acid-lime font-mono text-xl">{formatKRW(allowPg ? settle.payoutAmount : price)}</span>
              </div>
              {allowDirect && !allowPg && <p className="text-[11px] text-secondary pt-1">직거래만 선택 시 정산은 당사자 간 계좌이체로 진행됩니다.</p>}
            </div>
            {!allowPg && !allowDirect && <p className="text-error text-sm">결제 방식을 하나 이상 선택하세요.</p>}
          </div>
        </section>
      )}

      {/* CTA */}
      <div className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-2xl p-container-margin bg-gradient-to-t from-background via-background/90 to-transparent flex gap-stack-md">
        {step > 1 && (
          <button onClick={prev} className="flex-1 py-4 border border-outline-variant font-mono text-label-caps text-primary rounded-lg active:scale-95 transition-all">이전</button>
        )}
        <button
          onClick={next}
          disabled={!canNext || submitting || (step === 4 && !allowPg && !allowDirect)}
          className="flex-[2] py-4 bg-acid-lime font-mono text-label-caps text-black rounded-lg shadow-acid active:scale-95 transition-all disabled:opacity-40"
        >
          {submitting ? "등록 중…" : step === 4 ? "작품 등록하기" : "다음 단계"}
        </button>
      </div>
    </>
  );
}

const inputCls = "w-full bg-transparent border-0 border-b border-outline-variant py-3 text-primary placeholder:text-surface-container-highest focus:border-acid-lime outline-none transition-colors";

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="font-mono text-label-caps text-secondary mb-1 block uppercase">{label}</label>
      {children}
    </div>
  );
}

function PriceInput({ label, value, onChange }: { label: string; value: number; onChange: (n: number) => void }) {
  return (
    <div className="mt-stack-md pt-stack-md border-t border-outline-variant">
      <label className="font-mono text-[10px] text-secondary mb-1 block uppercase">{label}</label>
      <div className="flex items-center gap-2">
        <span className="font-mono text-secondary text-xl">₩</span>
        <input
          type="number"
          value={value || ""}
          onChange={(e) => onChange(Number(e.target.value))}
          placeholder="0"
          className="bg-transparent border-0 text-2xl font-mono text-primary w-full p-0 outline-none"
        />
      </div>
    </div>
  );
}

function SaleCard({ active, onClick, icon, title, desc, children }: { active: boolean; onClick: () => void; icon: string; title: string; desc: string; children: React.ReactNode }) {
  return (
    <div onClick={onClick} className={cn("p-stack-md border bg-surface-container rounded-lg cursor-pointer transition-all", active ? "border-acid-lime" : "border-outline-variant hover:border-acid-lime/50")}>
      <div className="flex justify-between items-start mb-2">
        <div className="flex items-center gap-3">
          <Icon name={icon} className={active ? "text-acid-lime" : "text-primary"} />
          <span className="font-display text-lg text-primary">{title}</span>
        </div>
        <span className={cn("w-5 h-5 rounded-full border-2 flex items-center justify-center", active ? "border-acid-lime bg-acid-lime" : "border-outline-variant")}>
          {active && <span className="w-2 h-2 bg-black rounded-full" />}
        </span>
      </div>
      <p className="text-secondary text-sm">{desc}</p>
      {active && children}
    </div>
  );
}

function PayToggle({ on, onToggle, title, sub, badge, icon }: { on: boolean; onToggle: () => void; title: string; sub: string; badge?: string; icon?: string }) {
  return (
    <div className="flex items-center justify-between p-stack-md bg-surface-container rounded-lg border border-outline-variant">
      <div className="flex items-center gap-4">
        <div className={cn("w-10 h-10 rounded-lg flex items-center justify-center text-xs font-bold", badge ? "bg-[#0064FF] text-white" : "bg-surface-container-highest text-primary")}>
          {badge ?? <Icon name={icon ?? "payments"} />}
        </div>
        <div>
          <p className="text-primary">{title}</p>
          <p className="text-secondary text-xs">{sub}</p>
        </div>
      </div>
      <button onClick={onToggle} role="switch" aria-checked={on} className={cn("relative w-11 h-6 rounded-full transition-colors", on ? "bg-acid-lime" : "bg-surface-container-highest")}>
        <span className={cn("absolute top-0.5 w-5 h-5 bg-white rounded-full transition-transform", on ? "translate-x-[22px]" : "translate-x-0.5")} />
      </button>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between items-center">
      <span className="text-secondary text-sm">{label}</span>
      <span className="text-primary font-medium">{value}</span>
    </div>
  );
}
