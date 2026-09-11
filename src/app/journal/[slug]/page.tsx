import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { renderSimpleMarkdown } from "@/lib/simple-markdown";

export default async function JournalPostPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const supabase = await createClient();

  const { data: post } = await supabase
    .from("journal_posts")
    .select("id, title, content, cover_image_path, created_at, status")
    .eq("slug", slug)
    .eq("status", "published")
    .single();

  if (!post) notFound();

  const coverUrl = post.cover_image_path
    ? supabase.storage.from("journal-images").getPublicUrl(post.cover_image_path).data.publicUrl
    : null;

  const contentHtml = renderSimpleMarkdown(post.content);

  return (
    <div className="mx-auto max-w-2xl px-4 py-16 sm:px-6 lg:px-8">
      <div className="flex items-center gap-2 text-xs tracking-editorial uppercase text-stone-dark">
        <Link href="/journal" className="hover:text-ink">Journal</Link>
        <span>/</span>
        <span className="text-ink">{post.title}</span>
      </div>

      <p className="mt-6 text-xs tracking-editorial uppercase text-stone-dark">
        {new Date(post.created_at).toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" })}
      </p>
      <h1 className="mt-2 font-display text-4xl leading-tight sm:text-5xl">{post.title}</h1>

      {coverUrl && (
        <div className="relative mt-8 aspect-[16/9] w-full overflow-hidden bg-off-white-soft">
          <Image src={coverUrl} alt={post.title} fill className="object-cover" />
        </div>
      )}

      <div
        className="prose prose-sm mt-10 max-w-none border-t border-border pt-8 text-stone-dark [&_h2]:mt-6 [&_h2]:font-display [&_h2]:text-2xl [&_h2]:text-ink [&_h3]:mt-5 [&_h3]:font-display [&_h3]:text-xl [&_h3]:text-ink [&_p]:mt-4"
        dangerouslySetInnerHTML={{ __html: contentHtml }}
      />
    </div>
  );
}
