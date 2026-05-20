"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

export default function AuthPage() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);

  // Check current status on mount
  useEffect(() => {
    fetch("/api/auth/status")
      .then((r) => r.json())
      .then(({ isAdmin }: { isAdmin: boolean }) => setIsAdmin(isAdmin));
  }, []);

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    const res = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password }),
    });
    setLoading(false);
    if (res.ok) {
      window.location.href = "/";
    } else {
      setError("Wrong password.");
    }
  }

  async function handleLogout() {
    await fetch("/api/auth/logout", { method: "POST" });
    window.location.href = "/auth";
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center">
      <div className="w-full max-w-sm px-6">
        {isAdmin ? (
          <div className="bg-gray-800 rounded-xl p-6 flex flex-col gap-4">
            <p className="text-sm text-gray-300">You&apos;re logged in as admin.</p>
            <button
              onClick={handleLogout}
              className="w-full bg-gray-700 hover:bg-gray-600 text-white py-2 rounded-lg text-sm font-medium transition-colors"
            >
              Logout
            </button>
            <button
              onClick={() => router.push("/")}
              className="w-full text-gray-400 hover:text-white py-2 text-sm transition-colors"
            >
              ← Back to dashboard
            </button>
          </div>
        ) : (
          <form onSubmit={handleLogin} className="bg-gray-800 rounded-xl p-6 flex flex-col gap-4">
            <h1 className="text-lg font-semibold">Admin Login</h1>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Password"
              autoFocus
              className="bg-gray-700 text-white placeholder-gray-500 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
            {error && <p className="text-red-400 text-sm">{error}</p>}
            <button
              type="submit"
              disabled={loading || !password}
              className="bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white py-2 rounded-lg text-sm font-medium transition-colors"
            >
              {loading ? "Logging in…" : "Login"}
            </button>
            <button
              type="button"
              onClick={() => router.push("/")}
              className="w-full text-gray-400 hover:text-white py-2 text-sm transition-colors"
            >
              ← Back to dashboard
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
