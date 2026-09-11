import { createAdminClient } from "@/lib/supabase/admin";
import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import JournalCoverUploader from "./journal-cover-uploader";

async function updatePost(postId: string, formData: FormData) {
  "use server";

  const title = String(formData.get("title") || "").trim();
  const excerpt = String(formData.get("excerpt") || "").trim();
  const content = String(formData.get("content") || "").trim();
  const status = String(formData.get("status") || "draft");

  if (!title || !content) {
    redirect(`/admin/journal/${postId}?error=invalid`);
  }

  const supabaseAdmin = createAdminClient();

  const { error } = await supabaseAdmin
    .from("journal_posts")
    .update({ title, excerpt: excerpt || null, content, status: status === "published" ? "published" : "draft", updated_at: new Date().toISOString() })
    .eq("id", postId);

  if (error) {
    redirect(`/admin/journal/${postId}?error=update_failed`);
  }

  redirect(`/admin/journal/${postId}?saved=1`);
}

async function deletePost(postId: string, coverPath: string | null) {
  "use server";

  const supabaseAdmin = createAdminClient();

  if (coverPath) {
    await supabaseAdmin.storage.from("journal-images").remove([coverPath]);
  }

  await supabaseAdmin.from("journal_posts").delete().eq("id", postId);

  redirect("/admin/journal");
}

export default async function EditJournalPostPage({ params, searchParams }: { params: Promise<{ id: string }>; searchParams: Promise<{ error?: string; saved?: string }> }) {
  const { id } = await params;
  const { error, saved } = await searchParams;

  const supabaseAdmin = createAdminClient();

  const { data: post } = await supabaseAdmin
    .from("journal_posts")
    .select("id, title, slug, excerpt, content, status, cover_image_path")
    .eq("id", id)
    .single();

  if (!post) notFound();

  const coverUrl = post.cover_image_path
    ? supabaseAdmin.storage.from("journal-images").getPublicUrl(post.cover_image_path).data.publicUrl
    : null;

  const boundUpdate = updatePost.bind(null, post.id);
  const boundDelete = deletePost.bind(null, post.id, post.cover_image_path);

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border pb-6">
        <div>
          <h1 className="font-display text-3xl tracking-editorial">{post.title}</h1>
          <p className="mt-1 text-xs text-ink-soft">/journal/{post.slug}</p>
        </div>
        <Link href="/admin/journal" className="text-xs tracking-editorial uppercase underline">Back to Journal</Link>
      </div>

      {saved && (
        <p className="mt-4 border border-green-700 bg-green-50 px-4 py-2 text-sm text-green-700">
          Perubahan disimpan.
        </p>
      )}
      {error && (
        <p className="mt-4 border border-red-600 bg-red-50 px-4 py-2 text-sm text-red-600">
          {error === "invalid" ? "Judul dan isi konten wajib diisi." : "Gagal menyimpan perubahan. Coba lagi."}
        </p>
      )}

      <div className="mt-8">
        <h2 className="border-b border-stone pb-2 text-xs tracking-editorial uppercase text-ink-soft">Cover Image</h2>
        <div className="mt-4">
          <JournalCoverUploader postId={post.id} initialPath={post.cover_image_path} initialUrl={coverUrl} />
        </div>
      </div>

      <div className="mt-8 border border-border bg-off-white-soft p-6">
        <form action={boundUpdate} className="max-w-2xl space-y-6">
          <div>
            <label htmlFor="title" className="text-xs tracking-editorial uppercase text-ink-soft">Title</label>
            <input id="title" name="title" type="text" defaultValue={post.title} required className="mt-1 w-full border border-border bg-off-white px-3 py-2 text-sm" />
          </div>

          <div>
            <label htmlFor="excerpt" className="text-xs tracking-editorial uppercase text-ink-soft">Excerpt (ringkasan singkat, opsional)</label>
            <textarea id="excerpt" name="excerpt" rows={2} defaultValue={post.excerpt ?? ""} className="mt-1 w-full border border-border bg-off-white px-3 py-2 text-sm" />
          </div>

          <div>
            <label htmlFor="content" className="text-xs tracking-editorial uppercase text-ink-soft">Content (mendukung Markdown: **bold**, *italic*, ## heading)</label>
            <textarea id="content" name="content" rows={16} defaultValue={post.content} required className="mt-1 w-full border border-border bg-off-white px-3 py-2 text-sm font-mono" />
          </div>

          <div>
            <label htmlFor="status" className="text-xs tracking-editorial uppercase text-ink-soft">Status</label>
            <select id="status" name="status" defaultValue={post.status} className="mt-1 w-full max-w-xs border border-border bg-off-white px-3 py-2 text-sm">
              <option value="draft">Draft</option>
              <option value="published">Published</option>
            </select>
          </div>

          <button type="submit" className="border border-ink bg-ink px-4 py-2 text-xs tracking-editorial uppercase text-off-white hover:bg-ink-soft transition-colors">
            Save Changes
          </button>
        </form>
      </div>

      <div className="mt-8 border border-red-600 bg-red-50 p-6">
        <h2 className="text-xs tracking-editorial uppercase text-red-600">Danger Zone</h2>
        <p className="mt-2 text-sm text-red-600">
          Menghapus post ini bersifat permanen, termasuk cover image-nya, dan tidak dapat dibatalkan.
        </p>
        <form action={boundDelete} className="mt-4">
          <button type="submit" className="border border-red-600 px-4 py-2 text-xs tracking-editorial uppercase text-red-600 hover:bg-red-600 hover:text-off-white transition-colors">
            Delete Post
          </button>
        </form>
      </div>
    </div>
  );
}
