"use client";

import { useCallback, useState } from "react";
import Cropper from "react-easy-crop";
import { getCroppedImageFile, type CropArea } from "@/lib/utils/cropImage";

type Point = { x: number; y: number };

export function CropModal({
  imageSrc,
  aspectRatio,
  onCancel,
  onSave,
}: {
  imageSrc: string;
  aspectRatio: number;
  onCancel: () => void;
  onSave: (file: File) => void;
}) {
  const [crop, setCrop] = useState<Point>({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<CropArea | null>(null);
  const [saving, setSaving] = useState(false);

  const onCropComplete = useCallback((_croppedArea: unknown, croppedAreaPx: CropArea) => {
    setCroppedAreaPixels(croppedAreaPx);
  }, []);

  const handleSave = async () => {
    if (!croppedAreaPixels) return;
    setSaving(true);
    try {
      const file = await getCroppedImageFile(imageSrc, croppedAreaPixels, `hero-crop-${Date.now()}.jpg`);
      onSave(file);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink/80 p-4">
      <div className="w-full max-w-2xl border border-border bg-off-white p-6">
        <h3 className="text-xs tracking-editorial uppercase text-ink-soft">
          Atur Crop Foto
        </h3>

        <div className="relative mt-4 h-96 w-full bg-ink-soft">
          <Cropper
            image={imageSrc}
            crop={crop}
            zoom={zoom}
            aspect={aspectRatio}
            onCropChange={setCrop}
            onZoomChange={setZoom}
            onCropComplete={onCropComplete}
          />
        </div>

        <div className="mt-4">
          <label className="block text-xs tracking-editorial uppercase text-ink-soft">
            Zoom
          </label>
          <input
            type="range"
            min={1}
            max={3}
            step={0.1}
            value={zoom}
            onChange={(e) => setZoom(Number(e.target.value))}
            className="mt-2 w-full"
          />
        </div>

        <div className="mt-6 flex justify-end gap-3">
          <button
            type="button"
            onClick={onCancel}
            disabled={saving}
            className="border border-border bg-off-white px-6 py-2 text-xs tracking-editorial uppercase text-ink-soft hover:bg-off-white-soft transition-colors disabled:opacity-50"
          >
            Batal
          </button>
          <button
            type="button"
            onClick={handleSave}
            disabled={saving || !croppedAreaPixels}
            className="border border-ink bg-ink px-6 py-2 text-xs tracking-editorial uppercase text-off-white hover:bg-ink-soft transition-colors disabled:opacity-50"
          >
            {saving ? "Menyimpan..." : "Simpan Crop"}
          </button>
        </div>
      </div>
    </div>
  );
}
