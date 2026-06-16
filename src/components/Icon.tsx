import { cn } from "@/lib/utils";

/** Material Symbols 래퍼. fill=true면 채워진 아이콘. */
export function Icon({
  name,
  fill,
  className,
  style,
}: {
  name: string;
  fill?: boolean;
  className?: string;
  style?: React.CSSProperties;
}) {
  return (
    <span className={cn("material-symbols-outlined select-none", fill && "fill", className)} style={style} aria-hidden>
      {name}
    </span>
  );
}
