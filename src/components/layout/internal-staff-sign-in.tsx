"use client";

import { useCallback, useEffect, useState } from "react";

import { verifyStaffPassword } from "@/services/api";

function hasStaffToken(): boolean {
  if (typeof window === "undefined") return true;
  return Boolean(
    window.sessionStorage.getItem("pf_api_token")?.trim() ||
      process.env.NEXT_PUBLIC_INTERNAL_API_KEY?.trim()
  );
}

/** Operator password → API token for browser calls to protected /api/designs routes. */
export function InternalStaffSignIn() {
  const [visible, setVisible] = useState(false);
  const [password, setPassword] = useState("");
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(() => {
    setVisible(!hasStaffToken());
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setPending(true);
    setError(null);
    try {
      await verifyStaffPassword(password);
      setPassword("");
      setVisible(false);
      window.dispatchEvent(new Event("pf-staff-auth"));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Sign-in failed");
    } finally {
      setPending(false);
    }
  }

  if (!visible) return null;

  return (
    <div className="border-b border-amber-200 bg-amber-50 px-4 py-3 md:px-6">
      <form
        onSubmit={(e) => void handleSubmit(e)}
        className="mx-auto flex max-w-7xl flex-wrap items-end gap-3"
      >
        <div className="min-w-[200px] flex-1">
          <p className="text-[12px] font-medium text-amber-950">
            Operator sign-in required for generate &amp; publish APIs
          </p>
          <p className="mt-0.5 text-[11px] text-amber-800/90">
            Enter the staff password from your deployment env (
            <code className="font-mono">STAFF_PASSWORD</code>).
          </p>
        </div>
        <input
          type="password"
          autoComplete="current-password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Staff password"
          className="h-9 min-w-[12rem] rounded-md border border-amber-300/80 bg-white px-3 text-[13px] text-neutral-900 outline-none focus:border-amber-500"
        />
        <button
          type="submit"
          disabled={pending || !password.trim()}
          className="h-9 rounded-md bg-neutral-900 px-4 text-[11px] font-medium tracking-wide text-white uppercase disabled:opacity-60"
        >
          {pending ? "Signing in…" : "Sign in"}
        </button>
        {error ? (
          <p className="w-full text-[12px] text-red-700">{error}</p>
        ) : null}
      </form>
    </div>
  );
}
