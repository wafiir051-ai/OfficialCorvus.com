"use client";

import { useEffect, useRef, useState } from "react";

export function Reveal({
  children,
  className = "",
  variant = "default",
}: {
  children: React.ReactNode;
  className?: string;
  variant?: "default" | "dramatic";
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        setVisible(entry.isIntersecting);
      },
      { threshold: 0.15 }
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  const hiddenTransform =
    variant === "dramatic"
      ? "opacity-0 scale-90 rotate-2 translate-y-16"
      : "opacity-0 translate-y-12 [transform:perspective(1000px)_rotateX(12deg)]";

  const visibleTransform =
    variant === "dramatic"
      ? "opacity-100 scale-100 rotate-0 translate-y-0"
      : "opacity-100 translate-y-0 [transform:perspective(1000px)_rotateX(0deg)]";

  return (
    <div
      ref={ref}
      style={{ transformOrigin: "center bottom" }}
      className={`transition-all duration-1000 ease-out will-change-transform ${
        visible ? visibleTransform : hiddenTransform
      } ${className}`}
    >
      {children}
    </div>
  );
}
