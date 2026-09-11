"use client";

import { useRef, useState } from "react";
import { CropModal } from "./CropModal";
import { removeHeroImage, replaceHeroImage } from "@/lib/actions/homepage-content";

export function HeroImageGallery({ images }: { images: string[] }) {
  const [cropTarget, setCropTarget] = useState<string | null>(null);
  const formRef = useRef<HTMLFormElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const oldUrlInputRef = useRef<HTMLInputElement>(null);

  const handleSaveCrop = (file: File) => {
    if (!cropTarget || !fileInputRef.current || !oldUrlInputRef.current || !formRef.current) return;

    const dataTransfer = new DataTransfer();
    dataTransfer.items.add(file);
    fileInputRef.current.files = dataTransfer.files;
    oldUrlInputRef.current.value = cropTarget;

    setCropTarget(null);
    formRef.current.requestSubmit();
  };

  return (
    <>
      {images.length > 0 && (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {images.map((url) => (
            <div key={url} className="relative">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={url}
                alt="Hero"
                className="h-24 w-full border border-border object-cover"
              />
              <div className="mt-1 flex gap-1">
                <button
                  type="button"
                  onClick={() => setCropTarget(url)}
                  className="flex-1 border border-border bg-off-white-soft px-2 py-1 text-[10px] tracking-editorial uppercase text-ink-soft hover:bg-ink hover:text-off-white transition-colors"
                >
                  Crop
                </button>
                <form action={removeHeroImage}>
                  <input type="hidden" name="url" value={url} />
                  <button
                    type="submit"
                    className="border border-border bg-off-white-soft px-2 py-1 text-[10px] tracking-editorial uppercase text-ink-soft hover:bg-danger hover:text-off-white transition-colors"
                  >
                    Hapus
                  </button>
                </form>
              </div>
            </div>
          ))}
        </div>
      )}

      <form ref={formRef} action={replaceHeroImage} className="hidden">
        <input ref={oldUrlInputRef} type="hidden" name="old_url" defaultValue="" />
        <input ref={fileInputRef} type="file" name="new_file" />
      </form>

      {cropTarget && (
        <CropModal
          imageSrc={cropTarget}
          aspectRatio={16 / 9}
          onCancel={() => setCropTarget(null)}
          onSave={handleSaveCrop}
        />
      )}
    </>
  );
}
