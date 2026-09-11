import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import Image from "next/image";

export default async function JournalPage() {
  const supabase = await createClient();

  const { data: posts } = await supabase
    .from("journal_posts")
    .select("id, title, slug, excerpt, cover_image_path, created_at")
    .eq("status", "published")
    .order("created_at", { ascending: false });

  const postsWithUrls = (posts ?? []).map((post) => {
    const coverUrl = post.cover_image_path
      ? supabase.storage.from("journal-images").getPublicUrl(post.cover_image_path).data.publicUrl
      : null;
    return { ...post, coverUrl };
  });

  return (
    <div className="mx-auto max-w-2xl px-4 py-16 sm:px-6 lg:px-8">
      <p className="text-xs tracking-editorial uppercase text-stone-dark">Journal</p>
      <h1 className="mt-2 font-display text-5xl leading-[0.95] sm:text-6xl">Catatan CORVUS</h1>

      {postsWithUrls.length === 0 ? (
        <div className="mt-10 flex flex-col items-center justify-center border-t border-ink pt-16 text-center">
          <p className="text-sm font-medium">Belum ada tulisan.</p>
          <p className="mt-2 max-w-sm text-sm text-stone-dark">
            Kami sedang menyiapkan cerita di balik proses, material, dan filosofi CORVUS. Pantau halaman ini untuk update selanjutnya.
          </p>
        </div>
      ) : (
        <div className="mt-10 space-y-14 border-t border-ink pt-10">
          {postsWithUrls.map((post) => (
            <Link key={post.id} href={`/journal/${post.slug}`} className="group block">
              {post.coverUrl && (
                <div className="relative aspect-[16/9] w-full overflow-hidden bg-off-white-soft">
                  <Image src={post.coverUrl} alt={post.title} fill className="object-cover transition-transform group-hover:scale-[1.02]" />
                </div>
              )}
              <p className="mt-4 text-xs tracking-editorial uppercase text-stone-dark">
                {new Date(post.created_at).toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" })}
              </p>
              <h2 className="mt-2 font-display text-2xl group-hover:underline">{post.title}</h2>
              {post.excerpt && <p className="mt-2 text-sm text-stone-dark">{post.excerpt}</p>}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
