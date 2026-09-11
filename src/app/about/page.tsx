export default function AboutPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6 lg:px-8">
      <p className="text-xs tracking-editorial uppercase text-olive">
        Our Story
      </p>
      <h1 className="mt-2 font-display text-6xl leading-[0.95] sm:text-7xl">
        About
        <br />
        CORVUS.
      </h1>

      <div className="mt-10 space-y-6 border-t border-ink pt-10 text-ink-soft">
        <p>
          CORVUS was built on a simple idea: clothing should be made to be
          worn, not just looked at. We focus on durable materials and
          stripped-back silhouettes — pieces that hold up to daily use and
          get better with age.
        </p>
        <p>
          Every piece is designed with a small, considered production run
          rather than mass volume. That means fewer styles, made with more
          attention, ordered directly through us.
        </p>
        <p>
          We keep things direct — no middlemen, no markup for a storefront
          you'll never visit. Just the product, and a conversation on
          WhatsApp if you have questions before you buy.
        </p>
      </div>
    </div>
  );
}
