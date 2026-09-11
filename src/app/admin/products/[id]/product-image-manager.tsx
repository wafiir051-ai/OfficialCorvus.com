"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import Image from "next/image";
import { useRouter } from "next/navigation";

type ProductImage = {
  id: string;
  storage_path: string;
  alt_text: string | null;
  sort_order: number;
  publicUrl: string;
};

export default function ProductImageManager({
  productId,
  initialImages,
}: {
  productId: string;
  initialImages: ProductImage[];
}) {
  const [images, setImages] = useState(initialImages);
  const [uploading, setUploading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const router = useRouter();

  async function handleUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    setErrorMsg(null);

    const supabase = createClient();
    const fileExt = file.name.split(".").pop();
    const filePath = `${productId}/${crypto.randomUUID()}.${fileExt}`;

    const { error: uploadError } = await supabase.storage
      .from("product-images")
      .upload(filePath, file);

    if (uploadError) {
      setErrorMsg(uploadError.message);
      setUploading(false);
      return;
    }

    const nextSortOrder = images.length > 0 ? Math.max(...images.map((i) => i.sort_order)) + 1 : 0;

    const { data: inserted, error: insertError } = await supabase
      .from("product_images")
      .insert({
        product_id: productId,
        storage_path: filePath,
        sort_order: nextSortOrder,
      })
      .select("id, storage_path, alt_text, sort_order")
      .single();

    if (insertError || !inserted) {
      setErrorMsg(insertError?.message ?? "Gagal menyimpan data gambar.");
      setUploading(false);
      return;
    }

    const { data: urlData } = supabase.storage.from("product-images").getPublicUrl(filePath);

    setImages((prev) => [...prev, { ...inserted, publicUrl: urlData.publicUrl }]);
    setUploading(false);
    router.refresh();
  }

  async function handleDelete(image: ProductImage) {
    const supabase = createClient();

    const { error: storageError } = await supabase.storage
      .from("product-images")
      .remove([image.storage_path]);

    if (storageError) {
      setErrorMsg(storageError.message);
      return;
    }

    const { error: dbError } = await supabase
      .from("product_images")
      .delete()
      .eq("id", image.id);

    if (dbError) {
      setErrorMsg(dbError.message);
      return;
    }

    setImages((prev) => prev.filter((i) => i.id !== image.id));
    router.refresh();
  }

  return (
    <div className="mt-4">
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        {images.map((image) => (
          <div key={image.id} className="group relative aspect-square border border-border">
            <Image
              src={image.publicUrl}
              alt={image.alt_text ?? ""}
              fill
              className="object-cover"
            />
            <button
              onClick={() => handleDelete(image)}
              className="absolute right-1 top-1 bg-ink px-2 py-1 text-[10px] uppercase text-off-white opacity-0 transition-opacity group-hover:opacity-100"
            >
              Hapus
            </button>
          </div>
        ))}

        <label className="flex aspect-square cursor-pointer items-center justify-center border border-dashed border-border text-xs tracking-editorial uppercase text-ink-soft hover:bg-stone/5">
          {uploading ? "Mengunggah..." : "+ Tambah Gambar"}
          <input
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleUpload}
            disabled={uploading}
          />
        </label>
      </div>

      {errorMsg && <p className="mt-3 text-sm text-red-600">{errorMsg}</p>}
    </div>
  );
}
