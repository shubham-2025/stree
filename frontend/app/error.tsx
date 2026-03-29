"use client";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const hintConfig =
    typeof error?.message === "string" &&
    error.message.includes("Supabase env missing");

  return (
    <div className="flex min-h-[40vh] flex-col items-center justify-center px-6 py-16 text-center">
      <h1 className="text-xl font-bold text-brand">Something went wrong</h1>
      {hintConfig ? (
        <p className="mt-3 max-w-md text-sm text-muted">
          Supabase environment variables are missing. In Vercel: Project →
          Settings → Environment Variables — add{" "}
          <code className="rounded bg-border/60 px-1 text-xs">
            NEXT_PUBLIC_SUPABASE_URL
          </code>{" "}
          and{" "}
          <code className="rounded bg-border/60 px-1 text-xs">
            NEXT_PUBLIC_SUPABASE_ANON_KEY
          </code>
          , then redeploy.
        </p>
      ) : (
        <p className="mt-3 max-w-md text-sm text-muted">
          Please try again. New deployment? Confirm Supabase env vars are set
          for Production and Preview.
        </p>
      )}
      {error.digest ? (
        <p className="mt-2 font-mono text-[10px] text-muted">
          Digest: {error.digest}
        </p>
      ) : null}
      <button
        type="button"
        onClick={() => reset()}
        className="mt-8 rounded-full bg-brand px-6 py-2.5 text-sm font-semibold text-white hover:bg-brand-dark"
      >
        Try again
      </button>
    </div>
  );
}
