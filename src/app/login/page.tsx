"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { isSupabaseConfigured, REFERRAL_BONUS } from "@/lib/config";

export default function LoginPage() {
  const router = useRouter();
  const configured = isSupabaseConfigured();

  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [referral, setReferral] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const redirectByRole = async (uid: string) => {
    const supabase = createClient();
    const { data } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", uid)
      .single();
    const role = (data as { role?: string } | null)?.role;
    if (role === "admin") router.push("/admin");
    else if (role === "delivery") router.push("/delivery");
    else router.push("/");
    router.refresh();
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setInfo(null);

    if (!configured) {
      setError(
        "Supabase is not configured yet. Add your keys to .env.local to enable login."
      );
      return;
    }

    setLoading(true);
    const supabase = createClient();

    try {
      if (mode === "signup") {
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: { name, phone, referred_by: referral || null },
          },
        });
        if (error) throw error;
        if (data.session && data.user) {
          await redirectByRole(data.user.id);
        } else {
          setInfo("Check your email to confirm your account, then sign in.");
          setMode("signin");
        }
      } else {
        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (error) throw error;
        if (data.user) await redirectByRole(data.user.id);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 py-10">
      <Link href="/" className="flex items-center gap-2 mb-6">
        <span className="text-3xl">🥟</span>
        <span className="font-extrabold text-2xl">
          Momo<span className="text-brand">za</span>
        </span>
      </Link>

      <div className="w-full max-w-sm card p-6">
        <div className="flex bg-bg-soft rounded-2xl p-1 mb-5">
          {(["signin", "signup"] as const).map((m) => (
            <button
              key={m}
              onClick={() => {
                setMode(m);
                setError(null);
                setInfo(null);
              }}
              className={`flex-1 py-2 rounded-xl text-sm font-semibold transition-colors ${
                mode === m ? "bg-brand text-white" : "text-muted"
              }`}
            >
              {m === "signin" ? "Sign In" : "Sign Up"}
            </button>
          ))}
        </div>

        {!configured && (
          <div className="mb-4 text-xs bg-brand-soft border border-brand/40 text-brand
            rounded-xl p-3">
            Demo mode: connect Supabase (see <code>.env.example</code>) to enable
            real accounts.
          </div>
        )}

        <form onSubmit={submit} className="space-y-3">
          {mode === "signup" && (
            <>
              <input
                className="input"
                placeholder="Full name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
              <input
                className="input"
                placeholder="Phone number"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
              />
            </>
          )}
          <input
            className="input"
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <input
            className="input"
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            minLength={6}
          />
          {mode === "signup" && (
            <input
              className="input"
              placeholder={`Referral code (optional) — earn ${REFERRAL_BONUS} coins`}
              value={referral}
              onChange={(e) => setReferral(e.target.value.toUpperCase())}
            />
          )}

          {error && <p className="text-brand text-sm">{error}</p>}
          {info && <p className="text-green-400 text-sm">{info}</p>}

          <button type="submit" disabled={loading} className="btn-brand w-full">
            {loading
              ? "Please wait…"
              : mode === "signin"
              ? "Sign In"
              : "Create Account"}
          </button>
          {mode === "signin" && (
  <div className="text-right mt-2">
    <Link
      href="/forgot-password"
      className="text-sm text-brand hover:underline"
    >
      Forgot Password?
    </Link>
  </div>
)}
        </form>

        <Link
          href="/"
          className="block text-center text-sm text-muted mt-4 hover:text-white"
        >
          ← Continue browsing
        </Link>
      </div>
    </div>
  );
}
