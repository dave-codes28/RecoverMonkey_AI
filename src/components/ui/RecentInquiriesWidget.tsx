import React, { useState } from "react";
import Link from "next/link";
import { useInquiries } from "../../hooks/useInquiries";
import { Card } from "./card";
import { Button } from "./button";
import { Badge } from "./badge";
import { Skeleton } from "./skeleton";
import { useToast } from "@/hooks/use-toast";

export function RecentInquiriesWidget() {
  // Fetch the most recent 8 inquiries
  const { inquiries, loading, error, refetch } = useInquiries({ page: 1, pageSize: 8 });
  const [syncing, setSyncing] = useState(false);
  const { toast } = useToast ? useToast() : { toast: () => {} };

  const handleManualSync = async () => {
    setSyncing(true);
    try {
      const res = await fetch("/api/manual-sync-inquiries", { method: "POST" });
      const data = await res.json();
      if (data.success) {
        toast && toast({ title: "Sync complete", description: `${data.inserted} inquiries synced.` });
        refetch();
      } else {
        toast && toast({ title: "Sync failed", description: data.error || "Unknown error", variant: "destructive" });
      }
    } catch (err) {
      toast && toast({ title: "Sync failed", description: err?.toString() || "Unknown error", variant: "destructive" });
    } finally {
      setSyncing(false);
    }
  };

  console.log('RecentInquiriesWidget inquiries:', inquiries);
  const inquiry = inquiries && inquiries.length > 0 ? inquiries[0] : null;

  return (
    <Card className="mb-6 p-4 border border-gray-200/60 dark:border-gray-700/60 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm">
      <div className="flex items-center justify-between mb-2">
        <h2 className="text-lg font-semibold">Recent Inquiries</h2>
        <div className="flex gap-2">
          <Button variant="outline" onClick={refetch} disabled={syncing}>Refresh</Button>
          <Button variant="secondary" onClick={handleManualSync} disabled={syncing}>
            {syncing ? "Syncing..." : "Manual Sync"}
          </Button>
        </div>
      </div>
      {loading ? (
        <Skeleton className="h-24 w-full" />
      ) : error ? (
        <div className="text-red-500">Failed to load inquiries</div>
      ) : !inquiries || inquiries.length === 0 ? (
        <div className="text-muted-foreground">No recent inquiries found.</div>
      ) : (
        <div className="max-h-64 overflow-y-auto space-y-6">
          {inquiries.map((inquiry, idx) => (
            <div key={inquiry.id || idx} className="space-y-4 border-b last:border-b-0 pb-4 last:pb-0">
          <div className="text-base font-medium mb-2">
            {inquiry.full_query || inquiry.query_summary}
          </div>
          <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
            <div><span className="font-semibold">Customer:</span> {inquiry.customer_email || "-"}</div>
            <div><span className="font-semibold">Cart Value:</span> {inquiry.cart_value !== undefined && inquiry.cart_value !== null ? `$${inquiry.cart_value}` : "-"}</div>
            <div><span className="font-semibold">Currency:</span> {inquiry.currency || "-"}</div>
            <div><span className="font-semibold">Created:</span> {inquiry.created_at ? new Date(inquiry.created_at).toLocaleString() : "-"}</div>
            <div><span className="font-semibold">Status:</span> <Badge variant="secondary">{inquiry.status}</Badge></div>
          </div>
            </div>
          ))}
        </div>
      )}
      <div className="flex justify-end mt-2">
        <Link href="/customer-inquiries" passHref legacyBehavior>
          <Button variant="link" asChild>
            <a>View All</a>
          </Button>
        </Link>
      </div>
    </Card>
  );
} 