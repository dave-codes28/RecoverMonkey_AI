"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { ArrowUpIcon, ArrowDownIcon, ShoppingCart, Mail, TrendingUp, Users, Loader2 } from "lucide-react"
import { useDashboardData } from "@/hooks/use-dashboard-data"
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { RecentInquiriesWidget } from "@/components/ui/RecentInquiriesWidget";
import { FloatingAssistantWidget } from "@/components/ui/FloatingAssistantWidget";

export function DashboardHome() {
  const { stats, recentActivity, loading, error, refetch } = useDashboardData();
  const { toast } = useToast();

  // Defensive: fallback values for stats
  const safeStats = stats || {
    totalAbandonedCarts: 0,
    recoveredCarts: 0,
    emailsSent: 0,
    recoveryRate: 0,
  };

  const dashboardStats = [
    {
      title: "Total Abandoned Carts",
      value: safeStats.totalAbandonedCarts?.toString() ?? "-",
      change: "+12%",
      changeType: "increase" as const,
      icon: ShoppingCart,
    },
    {
      title: "Recovered Carts",
      value: safeStats.recoveredCarts?.toString() ?? "-",
      change: "+8%",
      changeType: "increase" as const,
      icon: TrendingUp,
    },
    {
      title: "Emails Sent",
      value: safeStats.emailsSent?.toString() ?? "-",
      change: "+23%",
      changeType: "increase" as const,
      icon: Mail,
    },
    {
      title: "Recovery Rate",
      value: safeStats.recoveryRate !== undefined ? `${safeStats.recoveryRate}%` : "-",
      change: "-2%",
      changeType: "decrease" as const,
      icon: Users,
    },
  ];

  // Add sync handler
  const handleSyncAbandonedCarts = async () => {
    try {
      // TODO: Replace with actual shop_id from context/session
      const shop_id = localStorage.getItem('shop_id');
      if (!shop_id) {
        toast({ title: 'Error', description: 'No shop_id found', variant: 'destructive' });
        return;
      }
      const res = await fetch('/api/shopify/sync-abandoned-carts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ shop_id }),
      });
      const data = await res.json();
      if (res.ok) {
        toast({ title: 'Sync Complete', description: `${data.imported} new abandoned carts imported.`, variant: 'default' });
        refetch();
      } else {
        toast({ title: 'Sync Failed', description: data.error || 'Unknown error', variant: 'destructive' });
      }
    } catch (err) {
      toast({ title: 'Sync Failed', description: err instanceof Error ? err.message : 'Unknown error', variant: 'destructive' });
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin" />
        <span className="ml-2">Loading dashboard data...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <p className="text-red-500 mb-2">Error loading dashboard data</p>
          <p className="text-sm text-muted-foreground">{error}</p>
        </div>
      </div>
    );
  }

  // Defensive: fallback for recentActivity
  const safeRecentActivity = Array.isArray(recentActivity) ? recentActivity : [];

  return (
    <div className="space-y-8">
      <FloatingAssistantWidget />
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
          <p className="text-muted-foreground">Overview of your cart recovery performance</p>
        </div>
        <Button
          onClick={handleSyncAbandonedCarts}
          className="bg-green-600 hover:bg-green-700 text-white"
        >
          Sync Abandoned Carts
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {dashboardStats.map((stat) => (
          <Card key={stat.title} className="card-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
              <stat.icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
              <div className="flex items-center text-xs text-muted-foreground">
                {stat.changeType === "increase" ? (
                  <ArrowUpIcon className="mr-1 h-3 w-3 text-green-500" />
                ) : (
                  <ArrowDownIcon className="mr-1 h-3 w-3 text-red-500" />
                )}
                <span className={stat.changeType === "increase" ? "text-green-500" : "text-red-500"}>
                  {stat.change}
                </span>
                <span className="ml-1">from last month</span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Customer Inquiries Widget & Recent Activity */}
      <div className="grid gap-4 md:grid-cols-2">
        <RecentInquiriesWidget />
        <Card className="card-shadow max-h-[400px] flex flex-col">
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
            <CardDescription>Latest abandoned and recovered carts</CardDescription>
          </CardHeader>
          <CardContent className="overflow-y-auto flex-1">
            <div className="space-y-4">
              {safeRecentActivity.length > 0 ? (
                safeRecentActivity.map((activity) => (
                  <div
                    key={activity.id}
                    className="flex items-center space-x-4 p-2 rounded-lg hover:bg-muted/50 transition-colors"
                  >
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={activity.avatar || "/placeholder.svg"} alt={activity.customer} />
                      <AvatarFallback>
                        {activity.customer
                          .split(" ")
                          .map((n) => n[0])
                          .join("")}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 space-y-1">
                      <div className="flex items-center justify-between">
                        <p className="text-sm font-medium leading-none">{activity.customer}</p>
                        <Badge variant={activity.type === "recovered" ? "default" : "secondary"} className="text-xs">
                          {activity.type}
                        </Badge>
                      </div>
                      <div className="flex items-center justify-between">
                        <p className="text-xs text-muted-foreground">{activity.email}</p>
                        <p className="text-xs font-medium">{activity.amount}</p>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <p>No recent activity</p>
                  <p className="text-sm">Carts will appear here when they are abandoned or recovered</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recovery Progress full width below */}
      <Card className="card-shadow max-h-[400px] flex flex-col">
        <CardHeader>
          <CardTitle>Recovery Progress</CardTitle>
          <CardDescription>Current month recovery performance</CardDescription>
        </CardHeader>
        <CardContent className="overflow-y-auto flex-1 space-y-4">
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span>Email Recovery</span>
              <span>{safeStats.recoveryRate}%</span>
            </div>
            <Progress value={safeStats.recoveryRate} className="h-2" />
          </div>
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span>SMS Recovery</span>
              <span>45%</span>
            </div>
            <Progress value={45} className="h-2" />
          </div>
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span>Push Notifications</span>
              <span>32%</span>
            </div>
            <Progress value={32} className="h-2" />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
