"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { getMyDeliveryBoy } from "@/lib/delivery";
import type { DeliveryBoy, Profile } from "@/lib/types";

export default function DeliveryProfilePage() {
  const [me, setMe] = useState<DeliveryBoy | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    const load = async () => {
      const db = await getMyDeliveryBoy();
      setMe(db);
      const supabase = createClient();
      const { data: userData } = await supabase.auth.getUser();
      const uid = userData.user?.id;
      if (uid) {
        const { data } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", uid)
          .single();
        const p = data as Profile | null;
        setProfile(p);
        setName(p?.name || db?.name || "");
        setPhone(p?.phone || db?.phone || "");
      }
      setLoading(false);
    };
    load();
  }, []);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSaved(false);
    if (!profile) return;
    setSaving(true);
    const supabase = createClient();

    const { error: profileError } = await supabase
      .from("profiles")
      .update({ name: name.trim(), phone: phone.trim() })
      .eq("id", profile.id);

    if (profileError) {
      setError(profileError.message);
      setSaving(false);
      return;
    }

    // Keep the admin-facing delivery_boys record in sync.
    if (me) {
      await supabase
        .from("delivery_boys")
        .update({ name: name.trim(), phone: phone.trim() })
        .eq("id", me.id);
    }

    setSaved(true);
    setSaving(false);
  };

  if (loading) {
    return (
      <div className="space-y-3">
        <div className="h-12 rounded-2xl bg-bg-card animate-pulse" />
        <div className="h-12 rounded-2xl bg-bg-card animate-pulse" />
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-xl font-bold mb-1">Profile</h1>
      <p className="text-muted text-sm mb-4">Update your basic details.</p>

      <form onSubmit={submit} className="card p-4 space-y-3">
        <div>
          <label className="text-xs text-muted mb-1 block">Name</label>
          <input
            className="input"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
        </div>
        <div>
          <label className="text-xs text-muted mb-1 block">Phone</label>
          <input
            className="input"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
          />
        </div>
        <div>
          <label className="text-xs text-muted mb-1 block">Email</label>
          <input className="input opacity-60" value={profile?.email || ""} disabled />
        </div>

        {error && <p className="text-brand text-sm">{error}</p>}
        {saved && <p className="text-green-400 text-sm">Profile updated.</p>}

        <button type="submit" disabled={saving} className="btn-brand w-full">
          {saving ? "Saving…" : "Save Changes"}
        </button>
      </form>
    </div>
  );
}
