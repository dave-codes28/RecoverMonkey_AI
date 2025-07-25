import { useState, useEffect, useCallback } from "react";
import supabase from "../lib/supabaseClient";
import { FAQ } from "../types/supabase";

export function useFaqs(shop_id: string, search: string = "") {
  const [faqs, setFaqs] = useState<FAQ[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchFaqs = useCallback(async () => {
    setLoading(true);
    setError(null);
    let query = supabase.from("faqs").select("*").eq("shop_id", shop_id).order("created_at", { ascending: false });
    if (search) {
      query = query.or(
        `question.ilike.%${search}%,category.ilike.%${search}%`
      );
    }
    console.log('[useFaqs] fetchFaqs query:', { shop_id, search });
    const { data, error } = await query;
    if (error) setError(error.message);
    else setFaqs(data || []);
    setLoading(false);
  }, [shop_id, search]);

  useEffect(() => {
    fetchFaqs();
  }, [fetchFaqs]);

  // Add FAQ
  const addFaq = async (faq: Omit<FAQ, "id" | "created_at" | "updated_at">) => {
    setLoading(true);
    setError(null);
    const faqWithShopId = { ...faq, shop_id };
    console.log('[useFaqs] addFaq:', faqWithShopId);
    const { error } = await supabase
      .from("faqs")
      .insert([faqWithShopId]);
    if (error) {
      setError(error.message);
      setLoading(false);
      return false;
    }
    await fetchFaqs();
    setLoading(false);
    return true;
  };

  // Update FAQ
  const updateFaq = async (faq: FAQ) => {
    setLoading(true);
    setError(null);
    console.log('[useFaqs] updateFaq:', faq);
    const { error } = await supabase
      .from("faqs")
      .update(faq)
      .eq("id", faq.id);
    if (error) {
      setError(error.message);
      setLoading(false);
      return false;
    }
    await fetchFaqs();
    setLoading(false);
    return true;
  };

  // Delete FAQ
  const deleteFaq = async (id: string) => {
    setLoading(true);
    setError(null);
    console.log('[useFaqs] deleteFaq:', id);
    const { error } = await supabase
      .from("faqs")
      .delete()
      .eq("id", id);
    if (error) {
      setError(error.message);
      setLoading(false);
      return false;
    }
    await fetchFaqs();
    setLoading(false);
    return true;
  };

  return { faqs, loading, error, refetch: fetchFaqs, addFaq, updateFaq, deleteFaq };
} 