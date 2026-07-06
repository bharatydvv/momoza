"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useUser } from "@/context/useUser";
import { createClient } from "@/lib/supabase/client";
import { REFERRAL_BONUS } from "@/lib/config";

export default function ReferralPage() {
  const router = useRouter();
  const { profile, loading, isLoggedIn } = useUser();
  const [referredCount, setReferredCount] = useState(0);
  const [fetching, setFetching] = useState(true);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (loading) return;
    if (!isLoggedIn) {
      router.replace("/login");
      return;
    }
    const load = async () => {
      if (!profile?.referral_code) {
        setFetching(false);
        return;
      }
      const supabase = createClient();
      const { data } = await supabase.rpc("referral_count", {
        code: profile.referral_code,
      });
      setReferredCount(typeof data === "number" ? data : 0);
      setFetching(false);
    };
    load();
  }, [loading, isLoggedIn, profile, router]);

  const copyCode = async () => {
    if (!profile?.referral_code) return;
    await navigator.clipboard.writeText(profile.referral_code);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  if (loading || !isLoggedIn) {
    return (
      <div className="min-h-[50vh] flex items-center justify-center text-muted text-sm">
        Checking your account…
      </div>
    );
  }

  return (
    <div className="max-w-lg mx-auto px-4 py-6">
      <h1 className="text-xl font-bold mb-1">Referral &amp; Points</h1>
      <p className="text-muted text-sm mb-4">
        Share your code — you and your friend both earn {REFERRAL_BONUS} coins
        when they sign up.
      </p>

      <div className="card p-6 text-center mb-5">
        <p className="text-muted text-sm mb-2">Your Referral Code</p>
        <p className="text-3xl font-extrabold tracking-widest text-brand mb-4">
          {profile?.referral_code || "—"}
        </p>
        <button onClick={copyCode} className="btn-brand w-full">
          {copied ? "Copied!" : "Copy Code"}
        </button>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="card p-4 text-center">
          <p className="text-2xl font-bold">
            {fetching ? (
              <span className="inline-block w-10 h-7 rounded-lg bg-bg-elevated animate-pulse" />
            ) : (
              referredCount
            )}
          </p>
          <p className="text-xs text-muted mt-1">Friends Joined</p>
        </div>
        <div className="card p-4 text-center">
          <p className="text-2xl font-bold text-brand">
            {fetching ? (
              <span className="inline-block w-10 h-7 rounded-lg bg-bg-elevated animate-pulse" />
            ) : (
              `🪙 ${referredCount * REFERRAL_BONUS}`
            )}
          </p>
          <p className="text-xs text-muted mt-1">Coins Earned</p>
        </div>
      </div>
    </div>
  );
}
