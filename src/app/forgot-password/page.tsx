"use client";

import { useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";

export default function ForgotPasswordPage() {
  const supabase = createClient();

  const [email, setEmail] = useState("");
  const [msg, setMsg] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleReset(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setMsg("");

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/update-password`,
    });

    if (error) {
      setMsg(error.message);
    } else {
      setMsg("Password reset link has been sent to your email.");
    }

    setLoading(false);
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="card p-6 w-full max-w-sm">
        <h1 className="text-2xl font-bold mb-4">
          Forgot Password
        </h1>

        <form onSubmit={handleReset} className="space-y-4">
          <input
            className="input"
            type="email"
            placeholder="Email"
            required
            value={email}
            onChange={(e)=>setEmail(e.target.value)}
          />

          <button
            className="btn-brand w-full"
            disabled={loading}
          >
            {loading ? "Sending..." : "Send Reset Link"}
          </button>
        </form>

        {msg && (
          <p className="mt-4 text-sm">
            {msg}
          </p>
        )}

        <Link
          href="/login"
          className="block mt-5 text-center text-brand"
        >
          Back to Login
        </Link>
      </div>
    </div>
  );
}