"use client";
import { useState } from "react";
import supabase from "@/lib/supabaseClient";

export default function SignupPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }
    setLoading(true);
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${window.location.origin}/confirm-email`,
      },
    });
    setLoading(false);
    if (error) {
      setError(error.message);
    } else {
      setSuccess("Check your email to confirm your account.");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-neutral-950">
      <div className="max-w-md w-full p-6 bg-neutral-900 rounded shadow text-white">
        <h1 className="text-2xl font-bold mb-4 text-gray-100">Sign Up</h1>
        <form onSubmit={handleSignup} className="space-y-4" aria-label="Sign up form">
          <div>
            <label htmlFor="signup-email" className="block mb-1 font-medium text-gray-200">Email</label>
            <input
              id="signup-email"
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
            <label htmlFor="signup-password" className="block mb-1 font-medium text-gray-200">Password</label>
            <input
              id="signup-password"
              type="password"
              className="w-full border px-3 py-2 rounded bg-neutral-800 text-white"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
              autoComplete="new-password"
              aria-required="true"
            />
          </div>
          <div>
            <label htmlFor="signup-confirm-password" className="block mb-1 font-medium text-gray-200">Confirm Password</label>
            <input
              id="signup-confirm-password"
              type="password"
              className="w-full border px-3 py-2 rounded bg-neutral-800 text-white"
              value={confirmPassword}
              onChange={e => setConfirmPassword(e.target.value)}
              required
              autoComplete="new-password"
              aria-required="true"
            />
          </div>
          {error && <div className="text-red-400" role="alert">{error}</div>}
          {success && <div className="text-green-400" role="status">{success}</div>}
          <button
            type="submit"
            className="w-full bg-blue-600 text-white py-2 rounded font-semibold disabled:opacity-50"
            disabled={loading}
            aria-busy={loading}
          >
            {loading ? "Signing up..." : "Sign Up"}
          </button>
        </form>
        <div className="mt-4 text-center text-gray-400">
          Already have an account? <a href="/login" className="text-blue-400 underline">Log in</a>
        </div>
      </div>
    </div>
  );
} 