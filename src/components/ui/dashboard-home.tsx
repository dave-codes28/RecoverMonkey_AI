"use client";

import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { 
  ArrowUp, 
  ArrowDown, 
  ShoppingCart, 
  Mail, 
  TrendingUp, 
  Users, 
  Loader2,
  RefreshCw,
  DollarSign,
  Target,
  Activity,
  Eye,
  MessageSquare,
  Calendar,
  Sparkles
} from "lucide-react";
import { useDashboardData } from "@/hooks/use-dashboard-data";
import { RecentInquiriesWidget } from "@/components/ui/RecentInquiriesWidget";
import { FloatingAssistantWidget } from "@/components/ui/FloatingAssistantWidget";

export function DashboardHome() {
  const { stats, recentActivity, loading, error, refetch } = useDashboardData();
  // Remove all mock data, use real hooks only

  const dashboardStats = [
    {
      title: "Total Abandoned Carts",
      value: stats?.totalAbandonedCarts?.toString() ?? "-",
      change: "+12%",
      changeType: "increase" as const,
      icon: ShoppingCart,
      description: "Carts waiting for recovery",
      color: "bg-blue-500/10 text-blue-600 border-blue-200/50"
    },
    {
      title: "Recovered Carts",
      value: stats?.recoveredCarts?.toString() ?? "-",
      change: "+8%",
      changeType: "increase" as const,
      icon: TrendingUp,
      description: "Successfully converted",
      color: "bg-green-500/10 text-green-600 border-green-200/50"
    },
    {
      title: "Emails Sent",
      value: stats?.emailsSent?.toString() ?? "-",
      change: "+23%",
      changeType: "increase" as const,
      icon: Mail,
      description: "Recovery emails delivered",
      color: "bg-purple-500/10 text-purple-600 border-purple-200/50"
    },
    {
      title: "Recovery Rate",
      value: stats?.recoveryRate !== undefined ? `${stats.recoveryRate}%` : "-",
      change: "-2%",
      changeType: "decrease" as const,
      icon: Target,
      description: "Overall conversion rate",
      color: "bg-orange-500/10 text-orange-600 border-orange-200/50"
    },
  ];

  const getActivityBadgeStyle = (type: string) => {
    switch (type) {
      case "recovered":
        return "bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300 border-green-300/50";
      case "email_sent":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-300 border-blue-300/50";
      case "abandoned":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/50 dark:text-yellow-300 border-yellow-300/50";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-900/50 dark:text-gray-300 border-gray-300/50";
    }
  };

  if (loading) {
    return <DashboardSkeleton />;
  }

  return (
    <TooltipProvider>
      <div className="flex flex-col gap-8">
        {/* Enhanced Header */}
      <div className="flex items-center justify-between">
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg">
                <Activity className="h-6 w-6 text-white" />
              </div>
        <div>
                <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-gray-900 to-gray-600 dark:from-gray-100 dark:to-gray-300 bg-clip-text text-transparent">
                  Dashboard Overview
                </h1>
                <p className="text-muted-foreground">Monitor your cart recovery performance and insights</p>
              </div>
            </div>
        </div>
          <div className="flex items-center gap-3">
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="outline" size="icon" className="h-10 w-10">
                  <Eye className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>View Analytics</TooltipContent>
            </Tooltip>
        <Button
              onClick={refetch}
              className="bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white shadow-lg hover:shadow-xl transition-all duration-200"
        >
              <RefreshCw className="mr-2 h-4 w-4" />
              Sync Carts
        </Button>
          </div>
      </div>

        {/* Enhanced Stats Grid */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {dashboardStats.map((stat, index) => (
            <Card key={stat.title} className="group hover:shadow-lg transition-all duration-300 hover:-translate-y-1 border-0 shadow-md">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <div className="space-y-1">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    {stat.title}
                  </CardTitle>
                  <div className="text-2xl font-bold tracking-tight">{stat.value}</div>
                </div>
                <div className={`p-3 rounded-lg ${stat.color} group-hover:scale-110 transition-transform duration-200`}>
                  <stat.icon className="h-5 w-5" />
                </div>
            </CardHeader>
            <CardContent>
                <div className="flex items-center justify-between">
                  <div className="flex items-center text-xs">
                {stat.changeType === "increase" ? (
                      <ArrowUp className="mr-1 h-3 w-3 text-green-500" />
                ) : (
                      <ArrowDown className="mr-1 h-3 w-3 text-red-500" />
                )}
                    <span className={stat.changeType === "increase" ? "text-green-600 font-medium" : "text-red-600 font-medium"}>
                  {stat.change}
                </span>
                    <span className="text-muted-foreground ml-1">from last month</span>
                  </div>
              </div>
                <p className="text-xs text-muted-foreground mt-1">{stat.description}</p>
            </CardContent>
          </Card>
        ))}
      </div>

        {/* Enhanced Content Grid */}
        <div className="grid gap-8 lg:grid-cols-2">
          {/* Recent Inquiries Widget - restored as first card */}
          <RecentInquiriesWidget />

          {/* Recent Activity - Enhanced */}
          <Card className="hover:shadow-lg transition-shadow duration-300">
          <CardHeader>
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <CardTitle className="flex items-center gap-2">
                    <Activity className="h-5 w-5 text-blue-600" />
                    Recent Activity
                    <Badge variant="secondary" className="ml-2">
                      {recentActivity?.length ?? 0} items
                    </Badge>
                  </CardTitle>
                  <CardDescription>Latest abandoned and recovered carts</CardDescription>
              </div>
                <Button variant="ghost" size="sm" className="h-8 px-2 lg:px-3">
                  View All
                </Button>
              </div>
          </CardHeader>
            <CardContent className="space-y-4">
              {recentActivity && recentActivity.length > 0 ? (
                <div className="max-h-64 overflow-y-auto space-y-4">
                  {recentActivity.map((activity, index) => (
                  <div
                    key={activity.id}
                    className="group flex items-center space-x-4 p-3 rounded-lg hover:bg-muted/50 transition-colors cursor-pointer border border-transparent hover:border-border"
                  >
                    <Avatar className="h-10 w-10 ring-2 ring-background group-hover:ring-primary/20 transition-all">
                      <AvatarImage src={activity.avatar} alt={activity.customer} />
                      <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-600 text-white">
                        {activity.customer.split(" ").map((n) => n[0]).join("")}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 space-y-2">
                      <div className="flex items-center justify-between">
                        <p className="text-sm font-medium leading-none group-hover:text-primary transition-colors">
                          {activity.customer}
                        </p>
                        <div className="flex items-center gap-2">
                          <Badge variant="secondary" className={getActivityBadgeStyle(activity.type)}>
                            {activity.type.replace("_", " ")}
                        </Badge>
                          <span className="text-sm font-semibold">{activity.amount}</span>
                        </div>
                      </div>
                      <div className="flex items-center justify-between text-xs text-muted-foreground">
                        <span>{activity.email}</span>
                        <span className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          {activity.time}
                        </span>
                      </div>
                    </div>
                  </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12 text-muted-foreground">
                  <Activity className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <h3 className="font-semibold mb-2">No recent activity</h3>
                  <p className="text-sm">Carts will appear here when they are abandoned or recovered</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Recovery Insights - now full width below */}
        <Card className="hover:shadow-lg transition-shadow duration-300 w-full mt-8">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <CardTitle className="flex items-center gap-2">
                  <Sparkles className="h-5 w-5 text-purple-600" />
                  Recovery Insights
                </CardTitle>
                <CardDescription>Performance breakdown by channel</CardDescription>
              </div>
              <Button variant="ghost" size="sm" className="h-8 px-2 lg:px-3">
                <MessageSquare className="h-4 w-4" />
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-100 dark:bg-blue-900/50 rounded-lg">
                    <Mail className="h-4 w-4 text-blue-600" />
                  </div>
                  <span className="font-medium">Email Recovery</span>
                </div>
                <span className="font-semibold text-blue-600">{stats?.recoveryRate !== undefined ? `${stats.recoveryRate}%` : "-"}</span>
              </div>
              <Progress value={stats?.recoveryRate ?? 0} className="h-3 bg-blue-100 dark:bg-blue-900/20">
                <div className="h-full bg-gradient-to-r from-blue-500 to-blue-600 rounded-full transition-all" />
              </Progress>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-green-100 dark:bg-green-900/50 rounded-lg">
                    <MessageSquare className="h-4 w-4 text-green-600" />
                  </div>
                  <span className="font-medium">SMS Recovery</span>
                </div>
                <span className="font-semibold text-green-600">45%</span>
              </div>
              <Progress value={45} className="h-3 bg-green-100 dark:bg-green-900/20">
                <div className="h-full bg-gradient-to-r from-green-500 to-green-600 rounded-full transition-all" />
              </Progress>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-purple-100 dark:bg-purple-900/50 rounded-lg">
                    <Activity className="h-4 w-4 text-purple-600" />
                  </div>
                  <span className="font-medium">Push Notifications</span>
                </div>
                <span className="font-semibold text-purple-600">32%</span>
              </div>
              <Progress value={32} className="h-3 bg-purple-100 dark:bg-purple-900/20">
                <div className="h-full bg-gradient-to-r from-purple-500 to-purple-600 rounded-full transition-all" />
              </Progress>
            </div>

            <div className="pt-4 border-t">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Best performing channel</span>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span className="font-medium">SMS (45%)</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Floating Chatbot Widget - restored */}
        <FloatingAssistantWidget />
      </div>
    </TooltipProvider>
  );
}

// Enhanced Loading Skeleton
const DashboardSkeleton = () => (
  <div className="flex flex-col gap-8">
    {/* Header Skeleton */}
    <div className="flex items-center justify-between">
      <div className="space-y-2">
        <div className="flex items-center gap-3">
          <Skeleton className="h-10 w-10 rounded-lg" />
          <div>
            <Skeleton className="h-8 w-64 rounded-md" />
            <Skeleton className="mt-2 h-4 w-80 rounded-md" />
          </div>
        </div>
      </div>
      <div className="flex items-center gap-3">
        <Skeleton className="h-10 w-10 rounded-md" />
        <Skeleton className="h-10 w-36 rounded-md" />
      </div>
    </div>

    {/* Stats Skeleton */}
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
      {[...Array(4)].map((_, i) => (
        <Card key={i} className="shadow-md">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <div className="space-y-1">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-8 w-16" />
            </div>
            <Skeleton className="h-11 w-11 rounded-lg" />
          </CardHeader>
          <CardContent>
            <Skeleton className="h-3 w-full" />
            <Skeleton className="mt-1 h-3 w-3/4" />
          </CardContent>
        </Card>
      ))}
    </div>

    {/* Content Grid Skeleton */}
    <div className="grid gap-8 lg:grid-cols-2">
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-48" />
          <Skeleton className="h-4 w-64" />
        </CardHeader>
        <CardContent className="space-y-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="flex items-center space-x-4">
              <Skeleton className="h-10 w-10 rounded-full" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-3 w-1/2" />
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-48" />
          <Skeleton className="h-4 w-64" />
        </CardHeader>
        <CardContent className="space-y-6">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="space-y-2">
              <div className="flex justify-between">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-4 w-12" />
              </div>
              <Skeleton className="h-3 w-full" />
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  </div>
);  
