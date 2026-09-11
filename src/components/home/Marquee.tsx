export function Marquee({ text }: { text: string }) {
  const items = text
    .split("•")
    .map((item) => item.trim())
    .filter(Boolean);

  if (items.length === 0) return null;

  return (
    <div className="overflow-hidden border-y border-ink bg-ink py-3">
      <div className="flex w-max animate-marquee">
        {[...items, ...items, ...items].map((item, i) => (
          <span
            key={i}
            className="mx-6 shrink-0 text-xs tracking-editorial uppercase text-off-white"
          >
            {item} <span className="text-olive-light">•</span>
          </span>
        ))}
      </div>
    </div>
  );
}
