"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import supabase from "@/lib/supabaseClient";

export default function SetupShopPage() {
  const router = useRouter();
  const [storeName, setStoreName] = useState("");
  const [shopifyDomain, setShopifyDomain] = useState("");
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    // Get current user
    const { data: userData, error: userError } = await supabase.auth.getUser();
    if (userError || !userData.user) {
      setError("Could not get current user. Please log in again.");
      setLoading(false);
      return;
    }
    const owner_id = userData.user.id;
    // Insert shop
    const { data: shopInsertData, error: shopError } = await supabase.from("shops").insert([
      {
        owner_id,
        store_name: storeName,
        shopify_domain: shopifyDomain,
        email,
      },
    ]).select().single();
    if (shopError) {
      setLoading(false);
      setError(shopError.message);
      return;
    }
    // Update user_metadata with shop_id
    const shopId = shopInsertData?.id;
    if (!shopId) {
      setLoading(false);
      setError("Failed to retrieve new shop ID.");
      return;
    }
    const { error: updateError } = await supabase.auth.updateUser({
      data: { shop_id: shopId }
    });
    setLoading(false);
    if (updateError) {
      setError("Shop created, but failed to update user profile with shop ID: " + updateError.message);
    } else {
      router.push("/");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-neutral-950">
      <div className="max-w-md w-full p-6 bg-neutral-900 rounded shadow text-white">
        <h1 className="text-2xl font-bold mb-4 text-gray-100">Set Up Your Store</h1>
        <form onSubmit={handleSubmit} className="space-y-4" aria-label="Shop setup form">
          <div>
            <label htmlFor="store-name" className="block mb-1 font-medium text-gray-200">Store Name</label>
            <input
              id="store-name"
              type="text"
              className="w-full border px-3 py-2 rounded bg-neutral-800 text-white"
              value={storeName}
              onChange={e => setStoreName(e.target.value)}
              required
              aria-required="true"
            />
          </div>
          <div>
            <label htmlFor="shopify-domain" className="block mb-1 font-medium text-gray-200">Shopify Domain</label>
            <input
              id="shopify-domain"
              type="text"
              className="w-full border px-3 py-2 rounded bg-neutral-800 text-white"
              value={shopifyDomain}
              onChange={e => setShopifyDomain(e.target.value)}
              required
              aria-required="true"
              placeholder="your-store.myshopify.com"
            />
          </div>
          <div>
            <label htmlFor="store-email" className="block mb-1 font-medium text-gray-200">Store Email</label>
            <input
              id="store-email"
              type="email"
              className="w-full border px-3 py-2 rounded bg-neutral-800 text-white"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
              autoComplete="email"
              aria-required="true"
            />
          </div>
          {error && <div className="text-red-400" role="alert">{error}</div>}
          <button
            type="submit"
            className="w-full bg-blue-600 text-white py-2 rounded font-semibold disabled:opacity-50"
            disabled={loading}
            aria-busy={loading}
          >
            {loading ? "Setting up..." : "Create Store"}
          </button>
        </form>
      </div>
    </div>
  );
} 