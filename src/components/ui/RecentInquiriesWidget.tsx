import React from "react";
import Link from "next/link";
import { useInquiries } from "../../hooks/useInquiries";
import { Card } from "./card";
import { Button } from "./button";
import { Badge } from "./badge";
import { Skeleton } from "./skeleton";

export function RecentInquiriesWidget() {
  const { inquiries, loading, error, refetch } = useInquiries({ page: 1, pageSize: 5, status: "Pending" });

  return (
    <Card className="mb-6 p-4">
      <div className="flex items-center justify-between mb-2">
        <h2 className="text-lg font-semibold">Recent Inquiries</h2>
        <Button variant="outline" onClick={refetch}>Refresh</Button>
      </div>
      {loading ? (
        <Skeleton className="h-24 w-full" />
      ) : error ? (
        <div className="text-red-500">Failed to load inquiries</div>
      ) : (
        <ul>
          {inquiries.map((inq) => (
            <li key={inq.id} className="flex items-center justify-between py-2 border-b last:border-b-0">
              <div>
                <div className="font-medium">{inq.customer_email}</div>
                <div className="text-sm text-muted-foreground">
                  {inq.query_summary.length > 50
                    ? inq.query_summary.slice(0, 50) + "..."
                    : inq.query_summary}
                </div>
                <div className="text-xs text-muted-foreground">
                  {inq.cart_value && (
                    <>
                      {inq.cart_value > 100 && <Badge variant="secondary">High Value</Badge>} ${inq.cart_value.toFixed(2)}
                    </>
                  )} {" "}
                  • {/* TODO: Format time ago */}
                  2 hours ago
                </div>
              </div>
              <Link href={`/customer-inquiries?id=${inq.id}`} passHref legacyBehavior>
                <Button variant="link" asChild className="ml-2">
                  <a>Reply Now</a>
                </Button>
              </Link>
            </li>
          ))}
        </ul>
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