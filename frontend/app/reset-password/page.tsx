"use client";

import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";

import { createClient } from "@/lib/supabase/client";

export default function ResetPasswordPage() {
  const searchParams = useSearchParams();
  const supabase = useMemo(() => createClient(), []);
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [ready, setReady] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    let isMounted = true;

    const bootstrapRecoverySession = async () => {
      setLoading(true);
      setError(null);

      try {
        const code = searchParams.get("code");

        if (code) {
          const { error: exchangeError } = await supabase.auth.exchangeCodeForSession(code);
          if (exchangeError) {
            throw exchangeError;
          }
        } else if (typeof window !== "undefined" && window.location.hash) {
          const hashParams = new URLSearchParams(window.location.hash.replace(/^#/, ""));
          const accessToken = hashParams.get("access_token");
          const refreshToken = hashParams.get("refresh_token");

          if (accessToken && refreshToken) {
            const { error: sessionError } = await supabase.auth.setSession({
              access_token: accessToken,
              refresh_token: refreshToken,
            });

            if (sessionError) {
              throw sessionError;
            }

            window.history.replaceState({}, document.title, window.location.pathname);
          }
        }

        const {
          data: { session },
        } = await supabase.auth.getSession();

        if (!isMounted) {
          return;
        }

        if (!session) {
          setReady(false);
          setError("This password reset link is invalid or has expired. Please request a fresh link from the app.");
          return;
        }

        setReady(true);
      } catch (recoveryError) {
        if (!isMounted) {
          return;
        }

        setReady(false);
        setError(
          recoveryError instanceof Error
            ? recoveryError.message
            : "Unable to verify this password reset link."
        );
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    void bootstrapRecoverySession();

    return () => {
      isMounted = false;
    };
  }, [searchParams, supabase.auth]);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!password.trim() || !confirmPassword.trim()) {
      setError("Please fill both password fields.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    if (password.trim().length < 6) {
      setError("Password must be at least 6 characters long.");
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      const { error: updateError } = await supabase.auth.updateUser({
        password: password.trim(),
      });

      if (updateError) {
        throw updateError;
      }

      await supabase.auth.signOut();
      setSuccess(true);
      setReady(false);
      setPassword("");
      setConfirmPassword("");
    } catch (updateError) {
      setError(
        updateError instanceof Error
          ? updateError.message
          : "Unable to update your password right now."
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <main className="min-h-screen bg-[#faf7f2] px-4 py-10 text-[#231915]">
      <div className="mx-auto w-full max-w-md rounded-[28px] border border-[#eadfd5] bg-white p-6 shadow-[0_20px_60px_rgba(35,25,21,0.08)] sm:p-8">
        <p className="text-xs font-semibold uppercase tracking-[0.28em] text-[#7b1e3a]">
          Stree Sarees
        </p>
        <h1 className="mt-3 text-3xl font-semibold leading-tight">
          Reset your password
        </h1>
        <p className="mt-3 text-sm leading-7 text-[#6a5b53]">
          Set a new password for your Stree account, then return to the mobile app and sign in.
        </p>

        {loading ? (
          <p className="mt-6 rounded-2xl border border-[#eadfd5] bg-[#fcf9f6] px-4 py-4 text-sm text-[#6a5b53]">
            Verifying your reset link...
          </p>
        ) : success ? (
          <div className="mt-6 rounded-2xl border border-[#d7eadb] bg-[#f3fbf5] px-4 py-4 text-sm leading-7 text-[#205b2d]">
            Your password has been updated successfully. Return to the Stree mobile app and sign in with the new password.
          </div>
        ) : ready ? (
          <form className="mt-6 space-y-4" onSubmit={handleSubmit}>
            <label className="block">
              <span className="mb-2 block text-sm font-medium">New password</span>
              <input
                className="w-full rounded-2xl border border-[#d9ccc0] px-4 py-3 outline-none transition focus:border-[#7b1e3a] focus:ring-2 focus:ring-[#7b1e3a]/10"
                onChange={(event) => setPassword(event.target.value)}
                placeholder="At least 6 characters"
                type="password"
                value={password}
              />
            </label>

            <label className="block">
              <span className="mb-2 block text-sm font-medium">Confirm new password</span>
              <input
                className="w-full rounded-2xl border border-[#d9ccc0] px-4 py-3 outline-none transition focus:border-[#7b1e3a] focus:ring-2 focus:ring-[#7b1e3a]/10"
                onChange={(event) => setConfirmPassword(event.target.value)}
                placeholder="Re-enter your new password"
                type="password"
                value={confirmPassword}
              />
            </label>

            {error ? (
              <p className="rounded-2xl border border-[#f1caca] bg-[#fff5f5] px-4 py-3 text-sm leading-6 text-[#b42318]">
                {error}
              </p>
            ) : null}

            <button
              className="w-full rounded-2xl bg-[#7b1e3a] px-4 py-3 text-sm font-semibold text-white transition hover:bg-[#65172f] disabled:cursor-not-allowed disabled:opacity-60"
              disabled={submitting}
              type="submit"
            >
              {submitting ? "Updating password..." : "Update Password"}
            </button>
          </form>
        ) : (
          <div className="mt-6 rounded-2xl border border-[#f1caca] bg-[#fff5f5] px-4 py-4 text-sm leading-7 text-[#b42318]">
            {error ?? "This password reset link is invalid or has expired. Please request a fresh link from the app."}
          </div>
        )}
      </div>
    </main>
  );
}
