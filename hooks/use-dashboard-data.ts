import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';

interface DashboardStats {
  totalAbandonedCarts: number;
  recoveredCarts: number;
  emailsSent: number;
  recoveryRate: number;
}

interface RecentActivity {
  id: string;
  type: 'recovered' | 'abandoned';
  customer: string;
  email: string;
  amount: string;
  time: string;
  avatar?: string;
}

export function useDashboardData() {
  const [stats, setStats] = useState<DashboardStats>({
    totalAbandonedCarts: 0,
    recoveredCarts: 0,
    emailsSent: 0,
    recoveryRate: 0
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

      // Fetch recovered carts
      const { data: recoveredCarts, error: recoveredError } = await supabase
        .from('carts')
        .select('*')
        .eq('status', 'recovered');

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

      setStats({
        totalAbandonedCarts: totalAbandoned,
        recoveredCarts: totalRecovered,
        emailsSent: totalEmails,
        recoveryRate
      });

      // Create recent activity from recent carts
      const allCarts = [...(abandonedCarts || []), ...(recoveredCarts || [])];
      const recentCarts = allCarts
        .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
        .slice(0, 5);

      const activityData: RecentActivity[] = recentCarts.map(cart => ({
        id: cart.id,
        type: cart.status as 'recovered' | 'abandoned',
        customer: cart.email?.split('@')[0] || 'Unknown Customer',
        email: cart.email || 'no-email@example.com',
        amount: `$${cart.total_price || 0}`,
        time: formatTimeAgo(cart.created_at),
        avatar: undefined
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
    const now = new Date();
    const date = new Date(dateString);
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));

    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes} minutes ago`;
    
    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) return `${diffInHours} hours ago`;
    
    const diffInDays = Math.floor(diffInHours / 24);
    return `${diffInDays} days ago`;
  }

  return {
    stats,
    recentActivity,
    loading,
    error,
    refetch: fetchDashboardData
  };
} 