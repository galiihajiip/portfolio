import type { CSSProperties } from "react";
import { cn } from "@/lib/utils";
import type { TechMarqueeItem } from "@/types";

interface TechMarqueeProps {
  items: TechMarqueeItem[];
  className?: string;
}

function MarqueeTrack({
  items,
  direction = "left",
  duration = 30,
}: {
  items: TechMarqueeItem[];
  direction?: "left" | "right";
  duration?: number;
}) {
  const doubledItems = [...items, ...items];

  return (
    <div
      className="marquee-wrapper overflow-hidden"
      style={{
        maskImage: "linear-gradient(to right, transparent, black 10%, black 90%, transparent)",
      }}
    >
      <div
        className={cn(
          "marquee-track flex gap-6 w-max",
          direction === "left" ? "animate-marquee-left" : "animate-marquee-right",
        )}
        style={{ "--marquee-duration": `${duration}s` } as CSSProperties}
      >
        {doubledItems.map((item, idx) => (
          <div
            key={`${item.id}-${idx}`}
            className="flex items-center gap-2.5 px-4 py-2.5 bg-surface-subtle border border-border rounded-full text-text-secondary whitespace-nowrap select-none"
          >
            {item.logo_svg_code ? (
              <span
                className="w-5 h-5 flex items-center justify-center"
                dangerouslySetInnerHTML={{ __html: item.logo_svg_code }}
              />
            ) : item.logo_url ? (
              // Logo URLs can come from Supabase Storage or external asset sources.
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={item.logo_url}
                alt={item.name}
                className="w-5 h-5 object-contain"
                loading="lazy"
              />
            ) : (
              <span className="w-5 h-5 flex items-center justify-center text-xs font-bold text-accent">
                {item.name.charAt(0)}
              </span>
            )}
            <span className="text-sm font-medium">{item.name}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export function TechMarquee({ items, className }: TechMarqueeProps) {
  if (!items.length) return null;

  const midpoint = Math.ceil(items.length / 2);
  const row1 = items.slice(0, midpoint);
  const row2 = items.slice(midpoint);

  return (
    <section className={cn("py-12 space-y-4", className)}>
      <MarqueeTrack items={row1} direction="left" duration={35} />
      {row2.length > 0 && <MarqueeTrack items={row2} direction="right" duration={28} />}
    </section>
  );
}
