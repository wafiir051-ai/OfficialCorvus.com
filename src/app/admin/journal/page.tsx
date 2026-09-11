import { createAdminClient } from "@/lib/supabase/admin";
import Link from "next/link";

export default async function AdminJournalPage() {
  const supabaseAdmin = createAdminClient();

  const { data: posts, error } = await supabaseAdmin
    .from("journal_posts")
    .select("id, title, status, created_at")
    .order("created_at", { ascending: false });

  if (error) {
    return <p className="text-sm text-red-600">Gagal memuat journal: {error.message}</p>;
  }

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border pb-6">
        <h1 className="font-display text-3xl tracking-editorial">Journal</h1>
        <Link href="/admin/journal/new" className="border border-ink px-4 py-2 text-xs tracking-editorial uppercase hover:bg-ink hover:text-off-white transition-colors">
          + New Post
        </Link>
      </div>

      <div className="mt-6 overflow-x-auto border border-border">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border bg-off-white-soft text-left text-xs tracking-editorial uppercase text-ink-soft">
              <th className="py-3 pl-4 pr-4">Title</th>
              <th className="py-3 pr-4">Status</th>
              <th className="py-3 pr-4">Created</th>
              <th className="py-3 pr-4"></th>
            </tr>
          </thead>
          <tbody>
            {posts?.map((post) => (
              <tr key={post.id} className="border-b border-border last:border-0 hover:bg-off-white-soft">
                <td className="py-3 pl-4 pr-4 font-medium">{post.title}</td>
                <td className="py-3 pr-4 text-ink-soft capitalize">{post.status}</td>
                <td className="py-3 pr-4 text-ink-soft">{new Date(post.created_at).toLocaleDateString("id-ID")}</td>
                <td className="py-3 pr-4 text-right">
                  <Link href={`/admin/journal/${post.id}`} className="text-xs tracking-editorial uppercase underline">Edit</Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {posts?.length === 0 && (
          <p className="py-8 text-center text-sm text-stone-dark">Belum ada tulisan.</p>
        )}
      </div>
    </div>
  );
}
