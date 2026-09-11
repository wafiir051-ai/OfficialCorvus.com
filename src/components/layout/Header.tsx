import { getCurrentCustomer } from "@/lib/actions/customer-auth";
import { getAffiliateInfo } from "@/lib/actions/affiliate";
import { HeaderClient } from "./HeaderClient";

const NAV_LINKS = [
  { href: "/shop", label: "Shop" },
  { href: "/about", label: "About" },
  { href: "/journal", label: "Journal" },
  { href: "/contact", label: "Contact" },
];

export async function Header() {
  const customer = await getCurrentCustomer();

  let affiliateHref: string | null = null;
  let affiliateLabel = "Affiliate";

  if (customer) {
    const affiliateInfo = await getAffiliateInfo();
    affiliateHref = "/affiliate";
    if (affiliateInfo?.status === "pending") affiliateLabel = "Affiliate (Pending)";
    if (affiliateInfo?.status === "approved") affiliateLabel = "Dashboard Affiliate";
  }

  return (
    <HeaderClient
      navLinks={NAV_LINKS}
      isLoggedIn={Boolean(customer)}
      affiliateHref={affiliateHref}
      affiliateLabel={affiliateLabel}
    />
  );
}
