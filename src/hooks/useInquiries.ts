import { useState, useEffect, useCallback } from "react";
import supabase from "../lib/supabaseClient";
import { Inquiry } from "../types/supabase";

interface UseInquiriesOptions {
  status?: string;
  search?: string;
  dateRange?: { from: Date; to: Date };
  page?: number;
  pageSize?: number;
  store_id?: string;
  shop_id?: string;
}

export function useInquiries(options: UseInquiriesOptions = {}) {
  const [inquiries, setInquiries] = useState<Inquiry[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [total, setTotal] = useState(0);

  const fetchInquiries = useCallback(async () => {
    setLoading(true);
    setError(null);
    let query = supabase
      .from("inquiries")
      .select("*", { count: "exact" })
      .order("created_at", { ascending: false });

    if (options.store_id) {
      query = query.eq("store_id", options.store_id);
    }
    if (options.shop_id) {
      query = query.eq("shop_id", options.shop_id);
    }
    if (options.status && options.status !== "All") {
      query = query.eq("status", options.status);
    }
    if (options.search) {
      query = query.or(
        `customer_email.ilike.%${options.search}%,query_summary.ilike.%${options.search}%`
      );
    }
    if (options.dateRange) {
      query = query
        .gte("created_at", options.dateRange.from.toISOString())
        .lte("created_at", options.dateRange.to.toISOString());
    }
    const from = ((options.page || 1) - 1) * (options.pageSize || 10);
    const to = from + (options.pageSize || 10) - 1;
    query = query.range(from, to);

    const { data, error, count } = await query;
    if (error) setError(error.message);
    else {
      setInquiries(data || []);
      setTotal(count || 0);
    }
    setLoading(false);
  }, [options.store_id, options.shop_id, options.status, options.search, options.dateRange, options.page, options.pageSize]);

  useEffect(() => {
    fetchInquiries();
  }, [fetchInquiries]);

  // Add updateInquiryStatus
  const updateInquiryStatus = useCallback(async (id: string, newStatus: string) => {
    setLoading(true);
    setError(null);
    const { error } = await supabase
      .from("inquiries")
      .update({ status: newStatus })
      .eq("id", id);
    if (error) {
      setError(error.message);
      setLoading(false);
      return false;
    }
    await fetchInquiries();
    setLoading(false);
    return true;
  }, [fetchInquiries]);

  return { inquiries, loading, error, total, refetch: fetchInquiries, updateInquiryStatus };
} 