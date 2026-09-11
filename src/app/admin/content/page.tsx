import { getHomepageContent } from "@/lib/services/homepage-content";
import { updateHomepageSection, addHeroImages } from "@/lib/actions/homepage-content";
import { HeroImageGallery } from "@/components/admin/HeroImageGallery";

const SECTIONS: { key: string; label: string }[] = [
  { key: "hero", label: "Hero (Homepage Banner)" },
  { key: "marquee", label: "Marquee (Running Text)" },
  { key: "built_to_be_worn", label: "Built to Be Worn" },
  { key: "follow_corvus", label: "Follow CORVUS" },
];

export default async function AdminContentPage({
  searchParams,
}: {
  searchParams: Promise<{ saved?: string; error?: string }>;
}) {
  const params = await searchParams;
  const content = await getHomepageContent();

  return (
    <div>
      <h1 className="font-display text-3xl tracking-editorial border-b border-border pb-6">
        Content
      </h1>
      <p className="mt-4 text-sm text-stone-dark">
        Kelola konten section homepage. Kosongkan field untuk memakai teks default.
      </p>

      {params.saved && (
        <p className="mt-4 border border-green-700 bg-green-50 px-4 py-2 text-sm text-green-700">
          Konten berhasil disimpan.
        </p>
      )}
      {params.error && (
        <p className="mt-4 border border-red-600 bg-red-50 px-4 py-2 text-sm text-red-600">
          Gagal menyimpan konten. Coba lagi.
        </p>
      )}

      <div className="mt-10 space-y-10">
        {SECTIONS.map((section) => {
          const data = content[section.key];
          const updateAction = updateHomepageSection.bind(null, section.key);

          return (
            <div key={section.key} className="border border-border bg-off-white-soft p-6">
              <h2 className="border-b border-stone pb-2 text-xs tracking-editorial uppercase text-ink-soft">
                {section.label}
              </h2>

              {section.key === "hero" && (
                <div className="mt-6 space-y-4 border border-border bg-off-white p-4">
                  <p className="text-xs tracking-editorial uppercase text-ink-soft">
                    Foto Background Hero ({data?.heroImages?.length ?? 0} foto)
                  </p>

                  <HeroImageGallery images={data?.heroImages ?? []} />

                  <form action={addHeroImages} className="space-y-2">
                    <label
                      htmlFor="hero-images-input"
                      className="block text-xs tracking-editorial uppercase text-ink-soft"
                    >
                      Tambah Foto (bisa pilih beberapa sekaligus)
                    </label>
                    <input
                      id="hero-images-input"
                      name="hero_images"
                      type="file"
                      accept="image/*"
                      multiple
                      className="block w-full text-sm text-ink-soft file:mr-4 file:border file:border-border file:bg-off-white file:px-3 file:py-1.5 file:text-xs file:tracking-editorial file:uppercase"
                    />
                    <button
                      type="submit"
                      className="border border-ink bg-ink px-6 py-2 text-xs tracking-editorial uppercase text-off-white hover:bg-ink-soft transition-colors"
                    >
                      Upload Foto
                    </button>
                  </form>
                </div>
              )}

              <form action={updateAction} className="mt-6 space-y-5">
                <div>
                  <label
                    htmlFor={`${section.key}-heading`}
                    className="block text-xs tracking-editorial uppercase text-ink-soft"
                  >
                    Heading
                  </label>
                  <input
                    id={`${section.key}-heading`}
                    name="heading"
                    type="text"
                    defaultValue={data?.heading ?? ""}
                    placeholder={section.label}
                    className="mt-2 w-full border border-border bg-off-white px-3 py-2 text-sm focus:border-ink focus:outline-none"
                  />
                </div>

                <div>
                  <label
                    htmlFor={`${section.key}-body`}
                    className="block text-xs tracking-editorial uppercase text-ink-soft"
                  >
                    Body Text
                  </label>
                  <textarea
                    id={`${section.key}-body`}
                    name="body"
                    rows={3}
                    defaultValue={data?.body ?? ""}
                    className="mt-2 w-full border border-border bg-off-white px-3 py-2 text-sm focus:border-ink focus:outline-none"
                  />
                </div>

                {section.key !== "marquee" && (
                  <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                    <div>
                      <label
                        htmlFor={`${section.key}-link_label`}
                        className="block text-xs tracking-editorial uppercase text-ink-soft"
                      >
                        Link Label
                      </label>
                      <input
                        id={`${section.key}-link_label`}
                        name="link_label"
                        type="text"
                        defaultValue={data?.linkLabel ?? ""}
                        className="mt-2 w-full border border-border bg-off-white px-3 py-2 text-sm focus:border-ink focus:outline-none"
                      />
                    </div>
                    <div>
                      <label
                        htmlFor={`${section.key}-link_url`}
                        className="block text-xs tracking-editorial uppercase text-ink-soft"
                      >
                        Link URL
                      </label>
                      <input
                        id={`${section.key}-link_url`}
                        name="link_url"
                        type="text"
                        defaultValue={data?.linkUrl ?? ""}
                        placeholder="/about atau https://..."
                        className="mt-2 w-full border border-border bg-off-white px-3 py-2 text-sm focus:border-ink focus:outline-none"
                      />
                    </div>
                  </div>
                )}

                {section.key === "marquee" ? null : section.key === "follow_corvus" ? (
                  <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                    {[
                      { name: "image", label: "Gambar 1", url: data?.imageUrl },
                      { name: "image_2", label: "Gambar 2", url: data?.imageUrl2 },
                      { name: "image_3", label: "Gambar 3", url: data?.imageUrl3 },
                      { name: "image_4", label: "Gambar 4", url: data?.imageUrl4 },
                    ].map((slot) => (
                      <div key={slot.name}>
                        <label
                          htmlFor={`${section.key}-${slot.name}`}
                          className="block text-xs tracking-editorial uppercase text-ink-soft"
                        >
                          {slot.label}
                        </label>
                        {slot.url && (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={slot.url}
                            alt={slot.label}
                            className="mt-2 h-32 w-auto border border-border object-cover"
                          />
                        )}
                        <input
                          id={`${section.key}-${slot.name}`}
                          name={slot.name}
                          type="file"
                          accept="image/*"
                          className="mt-2 block w-full text-sm text-ink-soft file:mr-4 file:border file:border-border file:bg-off-white file:px-3 file:py-1.5 file:text-xs file:tracking-editorial file:uppercase"
                        />
                        <p className="mt-1 text-xs text-stone-dark">
                          Kosongkan jika tidak ingin mengganti gambar.
                        </p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div>
                    <label
                      htmlFor={`${section.key}-image`}
                      className="block text-xs tracking-editorial uppercase text-ink-soft"
                    >
                      Gambar
                    </label>
                    {data?.imageUrl && (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={data.imageUrl}
                        alt={section.label}
                        className="mt-2 h-32 w-auto border border-border object-cover"
                      />
                    )}
                    <input
                      id={`${section.key}-image`}
                      name="image"
                      type="file"
                      accept="image/*"
                      className="mt-2 block w-full text-sm text-ink-soft file:mr-4 file:border file:border-border file:bg-off-white file:px-3 file:py-1.5 file:text-xs file:tracking-editorial file:uppercase"
                    />
                    <p className="mt-1 text-xs text-stone-dark">
                      Kosongkan jika tidak ingin mengganti gambar.
                    </p>
                  </div>
                )}

                <button
                  type="submit"
                  className="border border-ink bg-ink px-6 py-2 text-xs tracking-editorial uppercase text-off-white hover:bg-ink-soft transition-colors"
                >
                  Simpan {section.label}
                </button>
              </form>
            </div>
          );
        })}
      </div>
    </div>
  );
}
