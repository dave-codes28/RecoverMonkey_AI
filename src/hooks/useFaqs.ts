import { useState, useEffect, useCallback } from "react";
import { supabase } from "../lib/supabaseClient";
import { FAQ } from "../types/supabase";

export function useFaqs(search: string = "") {
  const [faqs, setFaqs] = useState<FAQ[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchFaqs = useCallback(async () => {
    setLoading(true);
    setError(null);
    let query = supabase.from("faqs").select("*").order("created_at", { ascending: false });
    if (search) {
      query = query.or(
        `question.ilike.%${search}%,category.ilike.%${search}%`
      );
    }
    const { data, error } = await query;
    if (error) setError(error.message);
    else setFaqs(data || []);
    setLoading(false);
  }, [search]);

  useEffect(() => {
    fetchFaqs();
  }, [fetchFaqs]);

  return { faqs, loading, error, refetch: fetchFaqs };
} 