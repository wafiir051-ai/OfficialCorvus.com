import { headers } from "next/headers";
import { redirect } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { signOutAdmin, getCurrentAdmin } from "@/lib/actions/admin-auth";
import { AdminMobileNav } from "@/components/admin/AdminMobileNav";

const NAV_ITEMS = [
  { href: "/admin", label: "Dashboard", ownerOnly: false },
  { href: "/admin/products", label: "Products", ownerOnly: false },
  { href: "/admin/orders", label: "Orders", ownerOnly: false },
  { href: "/admin/customers", label: "Customers", ownerOnly: false },
  { href: "/admin/inventory", label: "Inventory", ownerOnly: false },
  { href: "/admin/journal", label: "Journal", ownerOnly: false },
  { href: "/admin/affiliates", label: "Affiliates", ownerOnly: true },
  { href: "/admin/content", label: "Content", ownerOnly: false },
  { href: "/admin/settings", label: "Settings", ownerOnly: true },
];

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const headersList = await headers();
  const pathname = headersList.get("x-pathname") ?? "";

  const isLoginPage = pathname.includes("/admin/login");

  if (isLoginPage) {
    return <>{children}</>;
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/admin/login");
  }

  const currentAdmin = await getCurrentAdmin();

  if (!currentAdmin) {
    await supabase.auth.signOut();
    redirect("/admin/login?error=not_admin");
  }

  const visibleNavItems = NAV_ITEMS.filter(
    (item) => !item.ownerOnly || currentAdmin.role === "owner"
  );

  return (
    <div className="flex min-h-screen bg-off-white">
      {/* Sidebar - desktop only */}
      <aside className="hidden w-60 flex-shrink-0 border-r border-border bg-ink text-off-white md:flex md:flex-col">
        <div className="px-6 py-6">
          <span className="font-logo text-xl tracking-normal">CORVUS</span>
          <p className="mt-1 text-xs tracking-editorial uppercase text-stone">Admin</p>
        </div>

        <nav className="flex-1 space-y-1 px-3">
          {visibleNavItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="block rounded px-3 py-2 text-sm tracking-editorial uppercase text-stone hover:bg-ink-soft hover:text-off-white transition-colors"
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="border-t border-ink-soft px-6 py-4">
          <form action={signOutAdmin}>
            <button
              type="submit"
              className="w-full border border-stone px-3 py-2 text-xs tracking-editorial uppercase text-stone hover:bg-ink-soft hover:text-off-white transition-colors"
            >
              Sign Out
            </button>
          </form>
        </div>
      </aside>

      {/* Main area */}
      <div className="flex flex-1 flex-col min-w-0">
        {/* Topbar */}
        <header className="flex h-16 items-center justify-between border-b border-border bg-off-white px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3 md:hidden">
            <AdminMobileNav navItems={visibleNavItems} />
            <span className="text-sm text-ink-soft font-display tracking-editorial">
              CORVUS ADMIN
            </span>
          </div>
          <div className="ml-auto flex items-center gap-2 text-sm text-ink-soft truncate max-w-[60%]">
            <span className="truncate">{currentAdmin?.fullName ?? user?.email}</span>
            {currentAdmin && (
              <span className="shrink-0 rounded border border-border px-1.5 py-0.5 text-[10px] uppercase tracking-editorial text-ink-soft">
                {currentAdmin.role}
              </span>
            )}
          </div>
        </header>

        <main className="flex-1 px-4 py-8 sm:px-6 lg:px-8">{children}</main>
      </div>
    </div>
  );
}
