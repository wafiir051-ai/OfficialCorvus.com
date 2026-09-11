import Link from "next/link";

export function Footer() {
  return (
    <footer className="mt-auto border-t border-border bg-ink text-off-white">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 gap-8 md:grid-cols-4">
          <div className="col-span-2 md:col-span-1">
            <span className="font-logo text-xl tracking-normal">
              CORVUS
            </span>
            <p className="mt-3 text-sm text-stone">
              Editorial staples, made to last.
            </p>
          </div>

          <div>
            <h3 className="text-xs tracking-editorial uppercase text-stone">
              Shop
            </h3>
            <ul className="mt-3 space-y-2 text-sm">
              <li>
                <Link href="/shop" className="hover:text-stone transition-colors">
                  All Products
                </Link>
              </li>
              <li>
                <Link href="/bag" className="hover:text-stone transition-colors">
                  Bag
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="text-xs tracking-editorial uppercase text-stone">
              Company
            </h3>
            <ul className="mt-3 space-y-2 text-sm">
              <li>
                <Link href="/about" className="hover:text-stone transition-colors">
                  About
                </Link>
              </li>
              <li>
                <Link href="/journal" className="hover:text-stone transition-colors">
                  Journal
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="text-xs tracking-editorial uppercase text-stone">
              Support
            </h3>
            <ul className="mt-3 space-y-2 text-sm">
              <li>
                <Link href="/faq" className="hover:text-stone transition-colors">
                  FAQ
                </Link>
              </li>
              <li>
                <Link href="/contact" className="hover:text-stone transition-colors">
                  Contact
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-10 flex items-center justify-between border-t border-ink-soft pt-6 text-xs text-stone-dark">
          <span>© {new Date().getFullYear()} CORVUS. All rights reserved.</span>
          <Link href="/admin/login" className="text-stone-dark hover:text-stone transition-colors">
            Admin
          </Link>
        </div>
      </div>
    </footer>
  );
}
