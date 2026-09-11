import { createAdminClient } from "@/lib/supabase/admin";
import { redirect } from "next/navigation";
import Link from "next/link";

function slugify(title: string) {
  return title.toLowerCase().trim().replace(/[^a-z0-9\s-]/g, "").replace(/\s+/g, "-").replace(/-+/g, "-");
}

async function createPost(formData: FormData) {
  "use server";

  const title = String(formData.get("title") || "").trim();
  const excerpt = String(formData.get("excerpt") || "").trim();
  const content = String(formData.get("content") || "").trim();

  if (!title || !content) {
    redirect("/admin/journal/new?error=invalid");
  }

  const supabaseAdmin = createAdminClient();
  let slug = slugify(title);

  const { data: existing } = await supabaseAdmin.from("journal_posts").select("slug").like("slug", `${slug}%`);

  if (existing && existing.length > 0) {
    const taken = new Set(existing.map((p) => p.slug));
    if (taken.has(slug)) {
      let i = 2;
      while (taken.has(`${slug}-${i}`)) i++;
      slug = `${slug}-${i}`;
    }
  }

  const { data: post, error } = await supabaseAdmin
    .from("journal_posts")
    .insert({ title, slug, excerpt: excerpt || null, content, status: "draft" })
    .select("id")
    .single();

  if (error || !post) {
    redirect("/admin/journal/new?error=insert_failed");
  }

  redirect(`/admin/journal/${post.id}`);
}

export default async function NewJournalPostPage({ searchParams }: { searchParams: Promise<{ error?: string }> }) {
  const { error } = await searchParams;

  return (
    <div>
      <div className="flex items-center justify-between border-b border-border pb-6">
        <h1 className="font-display text-3xl tracking-editorial">New Post</h1>
        <Link href="/admin/journal" className="text-xs tracking-editorial uppercase underline">Back to Journal</Link>
      </div>

      {error && (
        <p className="mt-4 border border-red-600 bg-red-50 px-4 py-2 text-sm text-red-600">
          {error === "invalid" ? "Judul dan isi konten wajib diisi." : "Gagal membuat post. Coba lagi."}
        </p>
      )}

      <div className="mt-8 border border-border bg-off-white-soft p-6">
        <form action={createPost} className="max-w-2xl space-y-6">
          <div>
            <label htmlFor="title" className="text-xs tracking-editorial uppercase text-ink-soft">Title</label>
            <input id="title" name="title" type="text" required className="mt-1 w-full border border-border bg-off-white px-3 py-2 text-sm" />
          </div>

          <div>
            <label htmlFor="excerpt" className="text-xs tracking-editorial uppercase text-ink-soft">Excerpt (ringkasan singkat, opsional)</label>
            <textarea id="excerpt" name="excerpt" rows={2} className="mt-1 w-full border border-border bg-off-white px-3 py-2 text-sm" />
          </div>

          <div>
            <label htmlFor="content" className="text-xs tracking-editorial uppercase text-ink-soft">Content (mendukung Markdown: **bold**, *italic*, ## heading)</label>
            <textarea id="content" name="content" required rows={16} className="mt-1 w-full border border-border bg-off-white px-3 py-2 text-sm font-mono" />
          </div>

          <p className="text-xs text-ink-soft">Post akan dibuat sebagai draft. Kamu bisa upload cover image dan mempublikasikannya setelah post ini dibuat.</p>

          <button type="submit" className="border border-ink bg-ink px-4 py-2 text-xs tracking-editorial uppercase text-off-white hover:bg-ink-soft transition-colors">
            Create Post
          </button>
        </form>
      </div>
    </div>
  );
}
