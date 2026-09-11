import { redirect } from "next/navigation";
import { getCurrentCustomer } from "@/lib/actions/customer-auth";
import { BagPageClient } from "./BagPageClient";

export default async function BagPage() {
  const customer = await getCurrentCustomer();
  if (!customer) {
    redirect("/login?redirect=/bag");
  }

  return <BagPageClient />;
}
