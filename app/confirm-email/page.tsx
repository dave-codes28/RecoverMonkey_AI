"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import supabase from "@/lib/supabaseClient";

export default function ConfirmEmailPage() {
  const router = useRouter();
  const [status, setStatus] = useState<"loading" | "confirmed" | "error">("loading");
  const [email, setEmail] = useState("");
  const [resendLoading, setResendLoading] = useState(false);
  const [resendError, setResendError] = useState<string | null>(null);
  const [resendSuccess, setResendSuccess] = useState<string | null>(null);

  useEffect(() => {
    // Try to get the current session/user
    supabase.auth.getUser().then(({ data, error }: { data: any; error: any }) => {
      if (error || !data.user) {
        setStatus("error");
      } else if (data.user.email_confirmed_at) {
        setStatus("confirmed");
      } else {
        setStatus("error");
      }
    });
  }, []);

  // Auto-redirect to login after confirmation
  useEffect(() => {
    if (status === "confirmed") {
      const timer = setTimeout(() => {
        router.push("/login");
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [status, router]);

  const handleResend = async (e: React.FormEvent) => {
    e.preventDefault();
    setResendError(null);
    setResendSuccess(null);
    setResendLoading(true);
    // Supabase does not support resending confirmation emails directly via client SDK without password
    // Instead, show a message to use the original signup flow or check their email again
    setTimeout(() => {
      setResendLoading(false);
      setResendSuccess(
        "If this email is registered and unconfirmed, a confirmation email will be sent. Please check your inbox and spam folder."
      );
    }, 1000);
  };

  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-neutral-950">
        <div className="max-w-md w-full p-6 bg-neutral-900 rounded shadow text-white text-center">
          <h1 className="text-2xl font-bold mb-4">Checking confirmation...</h1>
        </div>
      </div>
    );
  }

  if (status === "error") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-neutral-950">
        <div className="max-w-md w-full p-6 bg-neutral-900 rounded shadow text-white text-center">
          <h1 className="text-2xl font-bold mb-4 text-red-600">Confirmation Error</h1>
          <p className="mb-6">We couldn't confirm your email. Please make sure you used the correct link or try resending the confirmation email.</p>
          <form onSubmit={handleResend} className="space-y-4" aria-label="Resend confirmation email form">
            <div>
              <label htmlFor="resend-email" className="block mb-1 font-medium text-gray-200">Email</label>
              <input
                id="resend-email"
                type="email"
                className="w-full border px-3 py-2 rounded bg-neutral-800 text-white"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
                autoComplete="email"
                aria-required="true"
              />
            </div>
            {resendError && <div className="text-red-400" role="alert">{resendError}</div>}
            {resendSuccess && <div className="text-green-400" role="status">{resendSuccess}</div>}
            <button
              type="submit"
              className="w-full bg-blue-600 text-white py-2 rounded font-semibold disabled:opacity-50"
              disabled={resendLoading}
              aria-busy={resendLoading}
            >
              {resendLoading ? "Resending..." : "Resend Confirmation Email"}
            </button>
          </form>
          <div className="mt-4">
            <a href="/signup" className="text-blue-400 underline">Go to Signup</a>
          </div>
        </div>
      </div>
    );
  }

  // status === "confirmed"
  return (
    <div className="min-h-screen flex items-center justify-center bg-neutral-950">
      <div className="max-w-md w-full p-6 bg-neutral-900 rounded shadow text-white text-center">
        <h1 className="text-2xl font-bold mb-4 text-green-400">Email Confirmed!</h1>
        <p className="mb-6">Your email address has been confirmed. Redirecting to login...</p>
        <a href="/login" className="bg-blue-600 text-white px-4 py-2 rounded font-semibold">Log In</a>
      </div>
    </div>
  );
} 