"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";

type ReferralContextValue = {
  referralCode: string | null;
  clearReferralCode: () => void;
};

const ReferralContext = createContext<ReferralContextValue | undefined>(undefined);

const STORAGE_KEY = "corvus_referral_code";

export function ReferralProvider({ children }: { children: React.ReactNode }) {
  const [referralCode, setReferralCode] = useState<string | null>(null);
  const searchParams = useSearchParams();

  // Load any previously captured code from localStorage on mount
  useEffect(() => {
    try {
      const stored = window.localStorage.getItem(STORAGE_KEY);
      if (stored) setReferralCode(stored);
    } catch {
      // localStorage unavailable, ignore
    }
  }, []);

  // Capture ?ref=CODE from the URL whenever it appears, on any page
  useEffect(() => {
    const ref = searchParams.get("ref");
    if (!ref) return;

    const normalized = ref.trim().toUpperCase();
    if (!normalized) return;

    setReferralCode(normalized);
    try {
      window.localStorage.setItem(STORAGE_KEY, normalized);
    } catch {
      // localStorage unavailable, ignore
    }
  }, [searchParams]);

  function clearReferralCode() {
    setReferralCode(null);
    try {
      window.localStorage.removeItem(STORAGE_KEY);
    } catch {
      // localStorage unavailable, ignore
    }
  }

  return (
    <ReferralContext.Provider value={{ referralCode, clearReferralCode }}>
      {children}
    </ReferralContext.Provider>
  );
}

export function useReferral() {
  const context = useContext(ReferralContext);
  if (!context) {
    throw new Error("useReferral must be used within a ReferralProvider");
  }
  return context;
}
