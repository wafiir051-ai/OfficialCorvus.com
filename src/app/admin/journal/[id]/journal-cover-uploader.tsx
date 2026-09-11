"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import Image from "next/image";

export default function JournalCoverUploader({ postId, initialPath, initialUrl }: { postId: string; initialPath: string | null; initialUrl: string | null }) {
  const [path, setPath] = useState(initialPath);
  const [url, setUrl] = useState(initialUrl);
  const [uploading, setUploading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  async function handleUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    setErrorMsg(null);

    const supabase = createClient();
    const fileExt = file.name.split(".").pop();
    const filePath = `${postId}/${crypto.randomUUID()}.${fileExt}`;

    const { error: uploadError } = await supabase.storage.from("journal-images").upload(filePath, file);

    if (uploadError) {
      setErrorMsg(uploadError.message);
      setUploading(false);
      return;
    }

    if (path) {
      await supabase.storage.from("journal-images").remove([path]);
    }

    const { error: updateError } = await supabase.from("journal_posts").update({ cover_image_path: filePath }).eq("id", postId);

    if (updateError) {
      setErrorMsg(updateError.message);
      setUploading(false);
      return;
    }

    const { data: urlData } = supabase.storage.from("journal-images").getPublicUrl(filePath);

    setPath(filePath);
    setUrl(urlData.publicUrl);
    setUploading(false);
  }

  async function handleRemove() {
    if (!path) return;
    const supabase = createClient();

    await supabase.storage.from("journal-images").remove([path]);

    const { error } = await supabase.from("journal_posts").update({ cover_image_path: null }).eq("id", postId);

    if (error) {
      setErrorMsg(error.message);
      return;
    }

    setPath(null);
    setUrl(null);
  }

  return (
    <div>
      {url ? (
        <div className="group relative aspect-[16/9] w-full max-w-md border border-border">
          <Image src={url} alt="" fill className="object-cover" />
          <button type="button" onClick={handleRemove} className="absolute right-2 top-2 bg-ink px-2 py-1 text-[10px] uppercase text-off-white opacity-0 transition-opacity group-hover:opacity-100">
            Hapus
          </button>
        </div>
      ) : (
        <label className="flex aspect-[16/9] w-full max-w-md cursor-pointer items-center justify-center border border-dashed border-border text-xs tracking-editorial uppercase text-ink-soft hover:bg-stone/5">
          {uploading ? "Mengunggah..." : "+ Tambah Cover Image"}
          <input type="file" accept="image/*" className="hidden" onChange={handleUpload} disabled={uploading} />
        </label>
      )}

      {errorMsg && <p className="mt-2 text-sm text-red-600">{errorMsg}</p>}
    </div>
  );
}
