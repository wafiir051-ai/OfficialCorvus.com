"use client";

import { Suspense } from "react";
import { ReferralProvider } from "./ReferralContext";

export function ReferralProviderWithSuspense({ children }: { children: React.ReactNode }) {
  return (
    <Suspense fallback={children}>
      <ReferralProvider>{children}</ReferralProvider>
    </Suspense>
  );
}
