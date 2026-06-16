"use client";

import Image from "next/image";
import { useRef, useState } from "react";
import { cn } from "@/lib/utils";

/** 가로 스냅 이미지 캐러셀 (작품 상세 히어로) */
export function Carousel({ images, alt }: { images: string[]; alt: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const [index, setIndex] = useState(0);

  const onScroll = () => {
    const el = ref.current;
    if (!el) return;
    setIndex(Math.round(el.scrollLeft / el.offsetWidth));
  };

  return (
    <section className="relative w-full aspect-[4/5] md:aspect-[16/9] overflow-hidden bg-surface-container-low">
      <div ref={ref} onScroll={onScroll} className="flex h-full overflow-x-auto snap-x-mandatory no-scrollbar">
        {images.map((src, i) => (
          <div key={i} className="flex-none w-full h-full snap-center relative">
            <Image src={src} alt={`${alt} ${i + 1}`} fill priority={i === 0} sizes="(max-width:768px) 100vw, 672px" className="object-cover" />
          </div>
        ))}
      </div>
      {images.length > 1 && (
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-2">
          {images.map((_, i) => (
            <span
              key={i}
              className={cn("h-1 rounded-full transition-all duration-300", i === index ? "w-8 bg-acid-lime" : "w-2 bg-white/30")}
            />
          ))}
        </div>
      )}
    </section>
  );
}
