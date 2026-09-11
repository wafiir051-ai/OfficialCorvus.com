import Link from "next/link";
import { getFeaturedProducts } from "@/lib/services/products";
import { getHomepageContent } from "@/lib/services/homepage-content";
import { formatPrice } from "@/lib/utils/format";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Marquee } from "@/components/home/Marquee";
import { Reveal } from "@/components/home/Reveal";
import { HeroSlideshow } from "@/components/home/HeroSlideshow";

export default async function HomePage() {
  const [featuredProducts, content] = await Promise.all([
    getFeaturedProducts(4),
    getHomepageContent(),
  ]);

  const builtToBeWorn = content["built_to_be_worn"];
  const hero = content["hero"];
  const followCorvus = content["follow_corvus"];
  const marquee = content["marquee"];

  return (
    <>
      <Header />
      <main className="flex-1">
        {/* Hero */}
        <section className="relative border-b border-ink overflow-hidden bg-ink">
          {hero?.heroImages && hero.heroImages.length > 0 ? (
            <>
              <HeroSlideshow images={hero.heroImages} />
              <div className="absolute inset-0 bg-ink/60" />
            </>
          ) : (
            <div className="absolute inset-0 bg-gradient-to-br from-ink via-ink-soft to-ink" />
          )}
          <div className="relative mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8 lg:py-32">
            <p className="text-xs tracking-editorial uppercase text-olive-light animate-[fadein_0.6s_ease-out]">
              Contemporary Streetwear
            </p>
            <h1 className="mt-4 font-logo text-6xl leading-[0.95] text-off-white sm:text-7xl lg:text-8xl animate-[fadein_0.8s_ease-out]">
              {hero?.heading ?? "CORVUS"}
            </h1>
            <p className="mt-4 font-display text-xl tracking-editorial text-stone sm:text-2xl">
              {hero?.body ?? "Everyday, but different."}
            </p>
            <Link
              href={hero?.linkUrl ?? "/shop"}
              className="mt-8 inline-block bg-off-white px-8 py-3 text-sm tracking-editorial uppercase text-ink hover:bg-stone transition-colors"
            >
              {hero?.linkLabel ?? "Shop Collection"}
            </Link>
          </div>
        </section>

        <Marquee text={marquee?.body ?? "CONTEMPORARY STREETWEAR • EVERYDAY, BUT DIFFERENT"} />

        {/* Latest Drop */}
        <Reveal>
        <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
          <div className="flex items-baseline justify-between border-b border-ink pb-4">
            <div>
              <h2 className="font-display text-3xl">Latest Drop</h2>
              <p className="mt-1 text-sm text-stone-dark">New pieces from CORVUS</p>
            </div>
            <Link
              href="/shop"
              className="text-sm tracking-editorial uppercase text-ink-soft hover:text-ink transition-colors"
            >
              View All
            </Link>
          </div>

          {featuredProducts.length === 0 ? (
            <p className="mt-8 text-sm text-stone-dark">
              No featured products yet.
            </p>
          ) : (
            <div className="mt-10 grid grid-cols-2 gap-x-6 gap-y-10 sm:grid-cols-2 lg:grid-cols-4">
              {featuredProducts.map((product) => (
                <Link key={product.id} href={`/product/${product.slug}`} className="group">
                  <div className="aspect-[3/4] w-full overflow-hidden bg-off-white-soft">
                    {product.image_url ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={product.image_url}
                        alt={product.name}
                        className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center">
                        <span className="text-xs tracking-editorial uppercase text-stone-dark">
                          No Image
                        </span>
                      </div>
                    )}
                  </div>
                  <h3 className="mt-3 text-sm">{product.name}</h3>
                  <div className="mt-1 flex items-center gap-2">
                    <span className="text-sm text-ink-soft">
                      {formatPrice(product.price)}
                    </span>
                    {product.compare_at_price && (
                      <span className="text-xs text-stone-dark line-through">
                        {formatPrice(product.compare_at_price)}
                      </span>
                    )}
                  </div>
                </Link>
              ))}
            </div>
          )}
        </section>
        </Reveal>

        {/* Brand statement SS/26 */}
        <Reveal variant="dramatic">
        <section className="relative overflow-hidden border-t border-ink bg-ink text-off-white">
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-ink to-ink-soft" />
          <div className="relative mx-auto max-w-3xl px-4 py-24 text-center sm:px-6 lg:px-8">
            <h2 className="font-logo text-5xl sm:text-6xl">CORVUS SS/26</h2>
            <p className="mt-4 text-sm tracking-editorial uppercase text-stone">
              Made for everyday motion
            </p>
            <Link
              href="/shop"
              className="mt-8 inline-block border border-off-white px-8 py-3 text-sm tracking-editorial uppercase text-off-white hover:bg-off-white hover:text-ink transition-colors"
            >
              Discover
            </Link>
          </div>
        </section>
        </Reveal>

        {/* Built to be Worn */}
        <Reveal>
        <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 gap-10 lg:grid-cols-2 lg:items-center">
            <div>
              <h2 className="font-display text-4xl">
                {builtToBeWorn?.heading ?? "Built to Be Worn"}
              </h2>
              <p className="mt-6 max-w-md text-ink-soft">
                {builtToBeWorn?.body ??
                  "CORVUS is an independent clothing brand built around everyday pieces, distinct graphics, and a simple approach to fit and comfort."}
              </p>
              <Link
                href={builtToBeWorn?.linkUrl ?? "/about"}
                className="mt-6 inline-block text-sm tracking-editorial uppercase text-ink underline underline-offset-4 hover:text-ink-soft transition-colors"
              >
                {builtToBeWorn?.linkLabel ?? "Read Our Story"}
              </Link>
            </div>
            <div className="aspect-[4/3] w-full overflow-hidden bg-gradient-to-br from-stone via-off-white-soft to-stone">
              {builtToBeWorn?.imageUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={builtToBeWorn.imageUrl}
                  alt={builtToBeWorn.heading ?? "Built to Be Worn"}
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center">
                  <span className="text-xs tracking-editorial uppercase text-stone-dark">
                    Hangtag / Label Photo
                  </span>
                </div>
              )}
            </div>
          </div>
        </section>
        </Reveal>

        {/* Follow CORVUS */}
        <Reveal>
        <section className="border-t border-ink bg-off-white-soft">
          <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
            <div className="flex items-baseline justify-between">
              <h2 className="font-display text-3xl">
                {followCorvus?.heading ?? "Follow CORVUS"}
              </h2>
              <FollowCorvusLink
                href={followCorvus?.linkUrl ?? "https://instagram.com/corvus.official"}
                label={followCorvus?.linkLabel ?? "@corvus.official"}
              />
            </div>
            <div className="mt-8 grid grid-cols-2 gap-2 sm:grid-cols-4 sm:gap-4">
              {[
                followCorvus?.imageUrl,
                followCorvus?.imageUrl2,
                followCorvus?.imageUrl3,
                followCorvus?.imageUrl4,
              ].map((url, i) =>
                url ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    key={i}
                    src={url}
                    alt="CORVUS on Instagram"
                    className="aspect-square w-full object-cover"
                  />
                ) : (
                  <div
                    key={i}
                    className="aspect-square w-full bg-gradient-to-br from-ink-soft to-ink flex items-center justify-center"
                  >
                    <span className="text-[10px] tracking-editorial uppercase text-stone">
                      IG Photo {i + 1}
                    </span>
                  </div>
                )
              )}
            </div>
          </div>
        </section>
        </Reveal>
      </main>
      <Footer />
    </>
  );
}

function FollowCorvusLink({ href, label }: { href: string; label: string }) {
  return (
    // eslint-disable-next-line react/jsx-no-target-blank
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="text-sm tracking-editorial uppercase text-ink-soft hover:text-ink transition-colors"
    >
      {label}
    </a>
  );
}
