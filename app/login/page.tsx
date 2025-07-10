"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import supabase from "@/lib/supabaseClient";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [shopCheckLoading, setShopCheckLoading] = useState(false);
  const [shopCheckError, setShopCheckError] = useState<string | null>(null);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setShopCheckError(null);
    setLoading(true);
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    setLoading(false);
    if (error) {
      setError(error.message);
    } else if (data.session && data.user) {
      setShopCheckLoading(true);
      // Query shops table for a shop with owner_id = user.id
      const { data: shops, error: shopError } = await supabase
        .from("shops")
        .select("id")
        .eq("owner_id", data.user.id)
        .limit(1);
      setShopCheckLoading(false);
      if (shopError) {
        setShopCheckError("Failed to check shop status. Please try again.");
      } else if (shops && shops.length > 0) {
        router.push("/");
      } else {
        router.push("/setup-shop");
      }
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-neutral-950">
      <div className="max-w-md w-full p-6 bg-neutral-900 rounded shadow text-white">
        <h1 className="text-2xl font-bold mb-4 text-gray-100">Log In</h1>
        <form onSubmit={handleLogin} className="space-y-4" aria-label="Login form">
          <div>
            <label htmlFor="login-email" className="block mb-1 font-medium text-gray-200">Email</label>
            <input
              id="login-email"
              type="email"
              className="w-full border px-3 py-2 rounded bg-neutral-800 text-white"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
              autoComplete="email"
              aria-required="true"
            />
          </div>
          <div>
            <label htmlFor="login-password" className="block mb-1 font-medium text-gray-200">Password</label>
            <input
              id="login-password"
              type="password"
              className="w-full border px-3 py-2 rounded bg-neutral-800 text-white"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
              autoComplete="current-password"
              aria-required="true"
            />
          </div>
          {error && <div className="text-red-400" role="alert">{error}</div>}
          {shopCheckError && <div className="text-red-400" role="alert">{shopCheckError}</div>}
          <button
            type="submit"
            className="w-full bg-blue-600 text-white py-2 rounded font-semibold disabled:opacity-50"
            disabled={loading || shopCheckLoading}
            aria-busy={loading || shopCheckLoading}
          >
            {(loading || shopCheckLoading) ? "Logging in..." : "Log In"}
          </button>
        </form>
        <div className="mt-4 text-center text-gray-400">
          Don&apos;t have an account? <a href="/signup" className="text-blue-400 underline">Sign up</a>
        </div>
      </div>
    </div>
  );
} 