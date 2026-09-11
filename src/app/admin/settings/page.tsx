import { createAdminClient } from "@/lib/supabase/admin";
import { getCurrentAdmin } from "@/lib/actions/admin-auth";
import { redirect } from "next/navigation";
import { addWhatsappNumber, toggleWhatsappNumber, removeWhatsappNumber } from "@/lib/actions/whatsapp-numbers";

async function addStaff(formData: FormData) {
  "use server";

  const currentAdmin = await getCurrentAdmin();
  if (currentAdmin?.role !== "owner") {
    redirect("/admin?error=forbidden");
  }

  const fullName = String(formData.get("full_name") || "").trim();
  const email = String(formData.get("email") || "").trim();
  const password = String(formData.get("password") || "");

  if (!fullName || !email || password.length < 6) {
    redirect("/admin/settings?error=invalid_staff_input");
  }

  const supabaseAdmin = createAdminClient();

  const { data: newUser, error: createError } = await supabaseAdmin.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: { full_name: fullName },
  });

  if (createError || !newUser.user) {
    redirect("/admin/settings?error=staff_create_failed");
  }

  const { error: insertError } = await supabaseAdmin.from("admin_users").insert({
    user_id: newUser.user.id,
    full_name: fullName,
    role: "staff",
  });

  if (insertError) {
    redirect("/admin/settings?error=staff_link_failed");
  }

  redirect("/admin/settings?staffAdded=1");
}

async function removeStaff(adminUserId: string) {
  "use server";

  const currentAdmin = await getCurrentAdmin();
  if (currentAdmin?.role !== "owner") {
    redirect("/admin?error=forbidden");
  }

  const supabaseAdmin = createAdminClient();

  const { data: staffRecord } = await supabaseAdmin
    .from("admin_users")
    .select("user_id, role")
    .eq("id", adminUserId)
    .single();

  if (!staffRecord || staffRecord.role === "owner") {
    redirect("/admin/settings?error=cannot_remove_owner");
  }

  await supabaseAdmin.from("admin_users").delete().eq("id", adminUserId);
  await supabaseAdmin.auth.admin.deleteUser(staffRecord.user_id);

  redirect("/admin/settings?staffRemoved=1");
}

export default async function AdminSettingsPage({
  searchParams,
}: {
  searchParams: Promise<{
    error?: string;
    staffAdded?: string;
    staffRemoved?: string;
    waAdded?: string;
    waUpdated?: string;
    waRemoved?: string;
  }>;
}) {
  const { error, staffAdded, staffRemoved, waAdded, waUpdated, waRemoved } = await searchParams;

  const currentAdmin = await getCurrentAdmin();
  if (currentAdmin?.role !== "owner") {
    redirect("/admin?error=forbidden");
  }

  const supabaseAdmin = createAdminClient();

  const { data: adminUsers } = await supabaseAdmin
    .from("admin_users")
    .select("id, full_name, role, user_id, created_at")
    .order("created_at", { ascending: true });

  const { data: waNumbers } = await supabaseAdmin
    .from("whatsapp_numbers")
    .select("id, phone_number, weight, is_active")
    .order("created_at", { ascending: true });

  const ERROR_MESSAGES: Record<string, string> = {
    invalid_staff_input: "Nama, email, dan password (min. 6 karakter) wajib diisi.",
    staff_create_failed: "Gagal membuat akun staf. Email mungkin sudah terpakai.",
    staff_link_failed: "Akun dibuat, tapi gagal ditautkan sebagai staf.",
    cannot_remove_owner: "Tidak bisa menghapus akun owner.",
    forbidden: "Anda tidak punya akses ke halaman ini.",
    invalid_wa_input: "Nomor WhatsApp dan bobot wajib diisi dengan benar.",
    wa_add_failed: "Gagal menambahkan nomor WhatsApp.",
  };

  return (
    <div>
      <h1 className="font-display text-3xl tracking-editorial border-b border-border pb-6">Settings</h1>

      <div className="mt-10">
        <h2 className="border-b border-stone pb-2 text-xs tracking-editorial uppercase text-ink-soft">
          Staff Management
        </h2>
        <p className="mt-3 text-sm text-stone-dark">
          Staf punya akses ke Orders, Customers, dan Products (tanpa data komisi affiliate
          atau pengaturan toko).
        </p>

        {staffAdded && (
          <p className="mt-4 border border-green-700 bg-green-50 px-4 py-2 text-sm text-green-700">
            Akun staf ditambahkan.
          </p>
        )}
        {staffRemoved && (
          <p className="mt-4 border border-green-700 bg-green-50 px-4 py-2 text-sm text-green-700">
            Akun staf dihapus.
          </p>
        )}
        {error && (
          <p className="mt-4 border border-red-600 bg-red-50 px-4 py-2 text-sm text-red-600">
            {ERROR_MESSAGES[error] ?? "Terjadi kesalahan, coba lagi."}
          </p>
        )}

        <div className="mt-6 overflow-x-auto border border-border">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-off-white-soft text-left text-xs tracking-editorial uppercase text-ink-soft">
                <th className="py-3 pl-4 pr-4">Nama</th>
                <th className="py-3 pr-4">Role</th>
                <th className="py-3 pr-4"></th>
              </tr>
            </thead>
            <tbody>
              {(adminUsers ?? []).map((admin) => {
                const boundRemove = removeStaff.bind(null, admin.id);
                return (
                  <tr key={admin.id} className="border-b border-border last:border-0 hover:bg-off-white-soft">
                    <td className="py-3 pl-4 pr-4 font-medium">{admin.full_name}</td>
                    <td className="py-3 pr-4 capitalize text-ink-soft">{admin.role}</td>
                    <td className="py-3 pr-4 text-right">
                      {admin.role !== "owner" && (
                        <form action={boundRemove}>
                          <button
                            type="submit"
                            className="border border-red-600 px-3 py-1.5 text-xs tracking-editorial uppercase text-red-600 hover:bg-red-600 hover:text-off-white transition-colors"
                          >
                            Hapus
                          </button>
                        </form>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        <div className="mt-8 border border-border bg-off-white-soft p-6">
          <h3 className="text-xs tracking-editorial uppercase text-ink-soft">
            Tambah Staf Baru
          </h3>
          <form action={addStaff} className="mt-4 flex flex-wrap items-end gap-3">
            <div>
              <label className="text-xs tracking-editorial uppercase text-ink-soft">Nama</label>
              <input
                name="full_name"
                type="text"
                required
                className="mt-1 w-48 border border-border bg-off-white px-3 py-2 text-sm"
              />
            </div>
            <div>
              <label className="text-xs tracking-editorial uppercase text-ink-soft">Email</label>
              <input
                name="email"
                type="email"
                required
                className="mt-1 w-56 border border-border bg-off-white px-3 py-2 text-sm"
              />
            </div>
            <div>
              <label className="text-xs tracking-editorial uppercase text-ink-soft">
                Password
              </label>
              <input
                name="password"
                type="password"
                required
                minLength={6}
                className="mt-1 w-40 border border-border bg-off-white px-3 py-2 text-sm"
              />
            </div>
            <button
              type="submit"
              className="border border-ink bg-ink px-4 py-2 text-xs tracking-editorial uppercase text-off-white hover:bg-ink-soft transition-colors"
            >
              Tambah Staf
            </button>
          </form>
        </div>
      </div>

      <div className="mt-10">
        <h2 className="border-b border-stone pb-2 text-xs tracking-editorial uppercase text-ink-soft">
          Kontak WhatsApp Admin
        </h2>
        <p className="mt-3 text-sm text-stone-dark">
          Nomor WhatsApp yang menerima order dari customer. Order dibagi otomatis ke nomor
          aktif berdasarkan bobot (weight).
        </p>

        {waAdded && (
          <p className="mt-4 border border-green-700 bg-green-50 px-4 py-2 text-sm text-green-700">
            Nomor WhatsApp ditambahkan.
          </p>
        )}
        {waUpdated && (
          <p className="mt-4 border border-green-700 bg-green-50 px-4 py-2 text-sm text-green-700">
            Status nomor diperbarui.
          </p>
        )}
        {waRemoved && (
          <p className="mt-4 border border-green-700 bg-green-50 px-4 py-2 text-sm text-green-700">
            Nomor WhatsApp dihapus.
          </p>
        )}

        <div className="mt-6 overflow-x-auto border border-border">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-off-white-soft text-left text-xs tracking-editorial uppercase text-ink-soft">
                <th className="py-3 pl-4 pr-4">Nomor WhatsApp</th>
                <th className="py-3 pr-4">Bobot</th>
                <th className="py-3 pr-4">Status</th>
                <th className="py-3 pr-4 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {(waNumbers ?? []).map((wa) => {
                const boundToggle = toggleWhatsappNumber.bind(null, wa.id, wa.is_active);
                const boundRemove = removeWhatsappNumber.bind(null, wa.id);
                return (
                  <tr key={wa.id} className="border-b border-border last:border-0 hover:bg-off-white-soft">
                    <td className="py-3 pl-4 pr-4 font-medium">{wa.phone_number}</td>
                    <td className="py-3 pr-4 text-ink-soft">{wa.weight}</td>
                    <td className="py-3 pr-4">
                      <span
                        className={
                          wa.is_active
                            ? "inline-block rounded-full px-2.5 py-1 text-xs font-medium bg-emerald-100 text-emerald-800"
                            : "inline-block rounded-full px-2.5 py-1 text-xs font-medium bg-stone/20 text-ink-soft"
                        }
                      >
                        {wa.is_active ? "Aktif" : "Nonaktif"}
                      </span>
                    </td>
                    <td className="py-3 pr-4">
                      <div className="flex items-center justify-end gap-2">
                        <form action={boundToggle}>
                          <button
                            type="submit"
                            className="border border-border px-3 py-1.5 text-xs tracking-editorial uppercase text-ink-soft hover:border-ink hover:text-ink transition-colors"
                          >
                            {wa.is_active ? "Nonaktifkan" : "Aktifkan"}
                          </button>
                        </form>
                        <form action={boundRemove}>
                          <button
                            type="submit"
                            className="border border-red-600 px-3 py-1.5 text-xs tracking-editorial uppercase text-red-600 hover:bg-red-600 hover:text-off-white transition-colors"
                          >
                            Hapus
                          </button>
                        </form>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>

          {(waNumbers ?? []).length === 0 && (
            <p className="py-8 text-center text-sm text-stone-dark">Belum ada nomor WhatsApp.</p>
          )}
        </div>

        <div className="mt-8 border border-border bg-off-white-soft p-6">
          <h3 className="text-xs tracking-editorial uppercase text-ink-soft">
            Tambah Nomor WhatsApp
          </h3>
          <form action={addWhatsappNumber} className="mt-4 flex flex-wrap items-end gap-3">
            <div>
              <label className="text-xs tracking-editorial uppercase text-ink-soft">
                Nomor WhatsApp
              </label>
              <input
                name="phone_number"
                type="text"
                required
                placeholder="6281234567890"
                className="mt-1 w-56 border border-border bg-off-white px-3 py-2 text-sm"
              />
            </div>
            <div>
              <label className="text-xs tracking-editorial uppercase text-ink-soft">
                Bobot
              </label>
              <input
                name="weight"
                type="number"
                min="1"
                defaultValue="1"
                required
                className="mt-1 w-24 border border-border bg-off-white px-3 py-2 text-sm"
              />
            </div>
            <button
              type="submit"
              className="border border-ink bg-ink px-4 py-2 text-xs tracking-editorial uppercase text-off-white hover:bg-ink-soft transition-colors"
            >
              Tambah Nomor
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
