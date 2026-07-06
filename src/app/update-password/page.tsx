"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function UpdatePasswordPage() {

  const router = useRouter();
  const supabase = createClient();

  const [password,setPassword]=useState("");
  const [loading,setLoading]=useState(false);
  const [msg,setMsg]=useState("");

  async function handleUpdate(e:React.FormEvent){

    e.preventDefault();

    setLoading(true);

    const {error}=await supabase.auth.updateUser({
      password
    });

    if(error){
      setMsg(error.message);
    }else{
      setMsg("Password Updated Successfully");

      setTimeout(()=>{
        router.push("/login");
      },1500);
    }

    setLoading(false);
  }

  return(

    <div className="min-h-screen flex items-center justify-center px-4">

      <div className="card p-6 w-full max-w-sm">

        <h1 className="text-2xl font-bold mb-4">
          New Password
        </h1>

        <form
          onSubmit={handleUpdate}
          className="space-y-4"
        >

          <input
            className="input"
            type="password"
            placeholder="New Password"
            minLength={6}
            required
            value={password}
            onChange={(e)=>setPassword(e.target.value)}
          />

          <button
            className="btn-brand w-full"
            disabled={loading}
          >
            {loading ? "Updating..." : "Update Password"}
          </button>

        </form>

        {msg && (
          <p className="mt-4 text-sm">
            {msg}
          </p>
        )}

      </div>

    </div>

  );

}