"use client";

import { useState } from "react";
import { cn } from "@/lib/utils/cn";

type GalleryImage = { storage_path: string; alt_text: string | null };

export function ProductGallery({
  images,
  productName,
}: {
  images: GalleryImage[];
  productName: string;
}) {
  const [activeIndex, setActiveIndex] = useState(0);
  const active = images[activeIndex];

  if (images.length === 0) {
    return (
      <div className="flex aspect-[4/5] w-full items-center justify-center bg-off-white-soft text-sm text-stone-dark">
        No image available
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4 sm:flex-row-reverse">
      {/* Main image */}
      <div className="relative aspect-[4/5] w-full flex-1 overflow-hidden bg-off-white-soft">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={active.storage_path}
          alt={active.alt_text ?? productName}
          className="h-full w-full object-cover"
        />
      </div>

      {/* Thumbnails */}
      {images.length > 1 && (
        <div className="flex gap-2 sm:flex-col sm:w-20">
          {images.map((image, i) => (
            <button
              key={image.storage_path}
              type="button"
              onClick={() => setActiveIndex(i)}
              className={cn(
                "relative aspect-square w-16 shrink-0 overflow-hidden border transition-colors sm:w-full",
                activeIndex === i ? "border-ink" : "border-transparent hover:border-stone"
              )}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={image.storage_path}
                alt={image.alt_text ?? productName}
                className="h-full w-full object-cover"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
