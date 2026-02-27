"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";

export default function LoginForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    const supabase = createClient();
    const { data, error: authError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (authError) {
      setError(authError.message);
      setLoading(false);
      return;
    }

    // Verify the user has an admin profile
    const { data: profile } = await supabase
      .from("profiles")
      .select("is_admin")
      .eq("id", data.user.id)
      .single();

    if (!profile?.is_admin) {
      setError("This account does not have admin access. Make sure is_admin is set to true in the profiles table.");
      await supabase.auth.signOut();
      setLoading(false);
      return;
    }

    // Hard redirect so the browser sends fresh cookies to the middleware
    window.location.href = "/admin/dashboard";
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-white rounded-xl border border-border p-8 shadow-sm space-y-5"
    >
      <h2 className="text-xl font-bold text-foreground">Sign In</h2>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-lg">
          {error}
        </div>
      )}

      <div>
        <label className="block text-sm font-medium text-foreground mb-1">
          Email
        </label>
        <input
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full px-4 py-2.5 border border-border rounded-lg text-sm
                     focus:outline-none focus:ring-2 focus:ring-brand/20 focus:border-brand"
          placeholder="admin@example.com"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-foreground mb-1">
          Password
        </label>
        <input
          type="password"
          required
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full px-4 py-2.5 border border-border rounded-lg text-sm
                     focus:outline-none focus:ring-2 focus:ring-brand/20 focus:border-brand"
          placeholder="••••••••"
        />
      </div>

      <button
        type="submit"
        disabled={loading}
        className="w-full py-3 bg-brand text-white font-semibold rounded-lg
                   hover:bg-brand-dark transition-colors text-sm disabled:opacity-60"
      >
        {loading ? "Signing in..." : "Sign In"}
      </button>
    </form>
  );
}

