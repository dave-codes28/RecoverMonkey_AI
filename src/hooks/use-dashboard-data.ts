'use client';
import { useState, useEffect } from 'react';
import supabase from "@/lib/supabaseClient";

interface DashboardStats {
  totalAbandonedCarts: number;
  recoveredCarts: number;
  emailsSent: number;
  recoveryRate: number;
  totalRecoveryValue: number;
  recentRecoveries: number;
}

interface RecentActivity {
  id: string;
  type: 'recovered' | 'abandoned';
  customer: string;
  email: string;
  amount: string;
  time: string;
  avatar?: string;
  orderId?: string;
}

export function useDashboardData() {
  const [stats, setStats] = useState<DashboardStats>({
    totalAbandonedCarts: 0,
    recoveredCarts: 0,
    emailsSent: 0,
    recoveryRate: 0,
    totalRecoveryValue: 0,
    recentRecoveries: 0
  });
  const [recentActivity, setRecentActivity] = useState<RecentActivity[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  async function fetchDashboardData() {
    try {
      setLoading(true);
      setError(null);

      // Fetch abandoned carts
      const { data: abandonedCarts, error: abandonedError } = await supabase
        .from('carts')
        .select('*')
        .eq('status', 'abandoned');

      if (abandonedError) throw abandonedError;

      // Fetch recovered carts with more details
      const { data: recoveredCarts, error: recoveredError } = await supabase
        .from('carts')
        .select('*')
        .eq('status', 'recovered')
        .order('recovered_at', { ascending: false });

      if (recoveredError) throw recoveredError;

      // Fetch emails sent (from emails table)
      const { data: emailsSent, error: emailsError } = await supabase
        .from('emails')
        .select('*');

      if (emailsError) throw emailsError;

      // Calculate stats
      const totalAbandoned = abandonedCarts?.length || 0;
      const totalRecovered = recoveredCarts?.length || 0;
      const totalEmails = emailsSent?.length || 0;
      const recoveryRate = totalAbandoned > 0 ? Math.round((totalRecovered / totalAbandoned) * 100) : 0;
      
      // Calculate total recovery value
      const totalRecoveryValue = recoveredCarts?.reduce((sum, cart) => {
        return sum + (parseFloat(cart.total_price || '0') || 0);
      }, 0) || 0;

      // Calculate recent recoveries (last 7 days)
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
      const recentRecoveries = recoveredCarts?.filter(cart => {
        if (!cart.recovered_at) return false;
        return new Date(cart.recovered_at) > sevenDaysAgo;
      }).length || 0;

      setStats({
        totalAbandonedCarts: totalAbandoned,
        recoveredCarts: totalRecovered,
        emailsSent: totalEmails,
        recoveryRate,
        totalRecoveryValue,
        recentRecoveries
      });

      // Create recent activity from recent carts
      const allCarts = [...(abandonedCarts || []), ...(recoveredCarts || [])];
      const recentCarts = allCarts
        .sort((a, b) => {
          const dateA = a.recovered_at || a.created_at;
          const dateB = b.recovered_at || b.created_at;
          return new Date(dateB).getTime() - new Date(dateA).getTime();
        })
        .slice(0, 5);

      const activityData: RecentActivity[] = recentCarts.map(cart => ({
        id: cart.id,
        type: cart.status as 'recovered' | 'abandoned',
        customer: cart.email?.split('@')[0] || 'Unknown Customer',
        email: cart.email || 'no-email@example.com',
        amount: `$${cart.total_price || 0}`,
        time: formatTimeAgo(cart.recovered_at || cart.created_at),
        avatar: undefined,
        orderId: cart.recovered_order_id
      }));

      setRecentActivity(activityData);

    } catch (err) {
      console.error('Error fetching dashboard data:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch dashboard data');
    } finally {
      setLoading(false);
    }
  }

  function formatTimeAgo(dateString: string): string {
    if (typeof window === 'undefined') return ''; // Skip on server to avoid SSR mismatch
    
    const now = new Date();
    const date = new Date(dateString);
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
    
    if (diffInSeconds < 60) return `${diffInSeconds} seconds ago`;
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} minutes ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} hours ago`;
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  }

  return {
    stats,
    recentActivity,
    loading,
    error,
    refetch: fetchDashboardData
  };
} 