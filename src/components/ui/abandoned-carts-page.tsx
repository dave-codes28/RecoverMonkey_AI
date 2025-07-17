"use client";

import * as React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, MoreHorizontal, Eye, Mail, MessageSquare, RefreshCw } from "lucide-react";
import { CartDetailsModal } from "./cart-details-modal";
import { useToast } from "@/hooks/use-toast";

interface AbandonedCart {
  id: string;
  shopify_cart_id: string;
  shopify_customer_id: string;
  customer_email: string;
  total_price: number;
  currency: string;
  line_items: any[];
  created_at: string;
  status: string;
  metadata: any;
  customer_id?: string;
  customer?: {
    id: string;
    name: string;
    email: string;
    shopify_customer_id: string;
  };
}

const statusColors = {
  abandoned: "secondary",
  email_sent: "outline",
  recovered: "default",
  pending: "secondary",
} as const;

export function AbandonedCartsPage() {
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = React.useState("");
  const [statusFilter, setStatusFilter] = React.useState("all");
  const [carts, setCarts] = React.useState<AbandonedCart[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [sendingEmailCartId, setSendingEmailCartId] = React.useState<string | null>(null);
  const [selectedCart, setSelectedCart] = React.useState<AbandonedCart | null>(null);
  const [isCartDetailsOpen, setIsCartDetailsOpen] = React.useState(false);

  console.log('[Frontend] AbandonedCartsPage mounted');

  const fetchCarts = async () => {
    try {
      setLoading(true);
      setError(null);

      console.log('[Frontend] Fetching carts from API...');
      const response = await fetch('/api/carts', {
        credentials: 'include',
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to fetch carts');
      }

      const data = await response.json();
      console.log('[Frontend] Received carts:', data.carts?.length || 0);
      
      if (data.carts && data.carts.length > 0) {
        console.log('[Frontend] First cart structure:', {
          id: data.carts[0].id,
          shopify_cart_id: data.carts[0].shopify_cart_id,
          customer: data.carts[0].customer,
          line_items: data.carts[0].line_items,
          line_items_length: data.carts[0].line_items?.length,
          customer_email: data.carts[0].customer_email,
          status: data.carts[0].status,
        });
      }
      
      setCarts(data.carts || []);
    } catch (err) {
      console.error('[Frontend] Error fetching carts:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch abandoned carts');
    } finally {
      setLoading(false);
    }
  };

  const updateCartStatus = async (cartId: string, status: string) => {
    try {
      console.log('[Frontend] Updating cart status:', { cartId, status });
      
      const response = await fetch('/api/carts', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ cartId, status }),
        credentials: 'include',
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to update cart');
      }

      await fetchCarts();
    } catch (err) {
      console.error('[Frontend] Error updating cart status:', err);
      throw err;
    }
  };

  const handleSyncAbandonedCarts = async () => {
    console.log('[Frontend] Sync button clicked! Starting sync process...');
    try {
      const shop_id = localStorage.getItem('shop_id') || 'd5a79116-842f-4a4b-afd6-a4bb225119cf'; // Fallback for testing
      console.log('[Frontend] Retrieved shop_id:', shop_id);
      if (!shop_id) {
        toast({ title: 'Error', description: 'No shop_id found', variant: 'destructive' });
        return;
      }
      console.log('[Frontend] Sending sync request to /api/shopify/sync-abandoned-carts with shop_id:', shop_id);
      const res = await fetch('/api/shopify/sync-abandoned-carts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ shop_id }),
        credentials: 'include',
      });
      console.log('[Frontend] Received response:', res.status, res.statusText);
      const data = await res.json();
      console.log('[Frontend] Response data:', data);
      if (res.ok) {
        toast({ title: 'Sync Complete', description: `${data.imported} new abandoned carts imported.`, variant: 'default' });
        fetchCarts();
      } else {
        toast({ title: 'Sync Failed', description: data.error || 'Unknown error', variant: 'destructive' });
      }
    } catch (err) {
      console.error('[Frontend] Error during sync:', err);
      toast({ title: 'Sync Failed', description: err instanceof Error ? err.message : 'Unknown error', variant: 'destructive' });
    }
  };

  React.useEffect(() => {
    fetchCarts();
  }, []);

  const filteredCarts = carts.filter((cart) => {
    const customerName = cart.customer?.name || cart.customer_email || 'Unknown Customer';
    const customerEmail = cart.customer?.email || cart.customer_email || '';
    const matchesSearch =
      customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      customerEmail.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "all" || cart.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const formatCurrency = (amount: number, currency: string) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency || 'USD',
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const getProductNames = (items: any[]) => {
    if (!items || items.length === 0) {
      console.log('[Frontend] No items found in cart');
      return ['No items'];
    }
    
    console.log('[Frontend] Cart items structure:', items);
    
    return items.map((item) => {
      if (typeof item === 'string') return item;
      if (item && typeof item === 'object') {
        return item.title || item.name || item.product_title || 'Unknown Product';
      }
      return 'Unknown Product';
    }).slice(0, 3);
  };

  if (loading) {
    return (
      <div className="space-y-8">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Abandoned Carts</h2>
          <p className="text-muted-foreground">Loading abandoned carts...</p>
        </div>
        <div className="flex items-center justify-center py-8">
          <RefreshCw className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-8">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Abandoned Carts</h2>
          <p className="text-muted-foreground">Error loading abandoned carts</p>
        </div>
        <Card className="card-shadow">
          <CardContent className="pt-6">
            <div className="text-center text-red-600">
              <p>Error: {error}</p>
              <Button onClick={fetchCarts} className="mt-4">
                <RefreshCw className="mr-2 h-4 w-4" />
                Retry
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Abandoned Carts</h2>
          <p className="text-muted-foreground">Manage and recover abandoned shopping carts</p>
        </div>
        <Button
          onClick={() => handleSyncAbandonedCarts()} // Explicitly bind with arrow function
          className="bg-green-600 hover:bg-green-700 text-white"
        >
          Sync Abandoned Carts
        </Button>
      </div>

      {/* Filters */}
      <Card className="card-shadow">
        <CardHeader>
          <CardTitle>Filters</CardTitle>
          <CardDescription>Search and filter abandoned carts</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col space-y-4 md:flex-row md:space-y-0 md:space-x-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search by customer name or email..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-8 shadow-sm"
                />
              </div>
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[180px] shadow-sm">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="abandoned">Abandoned</SelectItem>
                <SelectItem value="email_sent">Email Sent</SelectItem>
                <SelectItem value="recovered">Recovered</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Carts Table */}
      <Card className="card-shadow-lg">
        <CardHeader>
          <CardTitle>Abandoned Carts ({filteredCarts.length})</CardTitle>
          <CardDescription>List of all abandoned shopping carts from your database</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border container-shadow">
            <Table>
              <TableHeader>
                <TableRow className="hover:bg-muted/50">
                  <TableHead>Customer</TableHead>
                  <TableHead>Items</TableHead>
                  <TableHead>Value</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredCarts.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                      No abandoned carts found
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredCarts.map((cart) => {
                    const customerName = cart.customer?.name || cart.customer_email || 'Unknown Customer';
                    const productNames = getProductNames(cart.line_items);
                    
                    return (
                      <TableRow key={cart.id} className="hover:bg-muted/50 transition-colors">
                        <TableCell>
                          <div className="flex items-center space-x-3">
                            <Avatar className="h-8 w-8 shadow-sm">
                              <AvatarImage src="/placeholder.svg" alt={customerName} />
                              <AvatarFallback>
                                {customerName
                                  .split("@")[0]
                                  .split(" ")
                                  .map((n) => n[0])
                                  .join("")}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <div className="font-medium">{customerName}</div>
                              <div className="text-sm text-muted-foreground">Cart ID: {cart.shopify_cart_id}</div>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="font-medium">{cart.line_items?.length || 0} items</div>
                          <div className="text-sm text-muted-foreground">
                            {productNames.slice(0, 2).join(", ")}
                            {productNames.length > 2 && "..."}
                          </div>
                        </TableCell>
                        <TableCell className="font-medium">
                          {formatCurrency(cart.total_price, cart.currency)}
                        </TableCell>
                        <TableCell>{formatDate(cart.created_at)}</TableCell>
                        <TableCell>
                          <Badge variant={statusColors[cart.status as keyof typeof statusColors]} className="shadow-sm">
                            {cart.status.replace("_", " ")}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end space-x-2">
                            <Button
                              variant="outline"
                              size="sm"
                              disabled={sendingEmailCartId === cart.id}
                              onClick={async () => {
                                setSendingEmailCartId(cart.id);
                                try {
                                  console.log('[Frontend] Sending recovery email for cart:', cart.shopify_cart_id);
                                  const response = await fetch('/api/email/send', {
                                    method: 'POST',
                                    headers: { 'Content-Type': 'application/json' },
                                    body: JSON.stringify({ cart_id: cart.shopify_cart_id }),
                                  });
                                  const result = await response.json();
                                  if (!response.ok) {
                                    console.error('[Frontend] Email send failed:', result);
                                    throw new Error(result.error || 'Failed to send recovery email');
                                  }
                                  console.log('[Frontend] Email sent successfully:', result);
                                  alert('Recovery email sent successfully!');
                                  await updateCartStatus(cart.id, 'email_sent');
                                } catch (err) {
                                  console.error('[Frontend] Error sending email:', err);
                                  alert(`Failed to send recovery email: ${err instanceof Error ? err.message : 'Unknown error'}`);
                                } finally {
                                  setSendingEmailCartId(null);
                                }
                              }}
                              className="shadow-sm"
                            >
                              {sendingEmailCartId === cart.id ? (
                                <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                              ) : (
                                <Mail className="mr-2 h-4 w-4" />
                              )}
                              Send Recovery Email
                            </Button>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" className="h-8 w-8 p-0 hover:bg-muted">
                                <span className="sr-only">Open menu</span>
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="shadow-lg">
                              <DropdownMenuLabel>Actions</DropdownMenuLabel>
                              <DropdownMenuItem
                                onClick={() => {
                                  setSelectedCart(cart);
                                  setIsCartDetailsOpen(true);
                                }}
                              >
                                <Eye className="mr-2 h-4 w-4" />
                                View Details
                              </DropdownMenuItem>
                              <DropdownMenuItem>
                                <MessageSquare className="mr-2 h-4 w-4" />
                                Chat with Customer
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem 
                                onClick={() => updateCartStatus(cart.id, 'recovered')}
                                className="text-green-600"
                              >
                                Mark as Recovered
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
      <CartDetailsModal
        cart={selectedCart}
        isOpen={isCartDetailsOpen}
        onClose={() => setIsCartDetailsOpen(false)}
        onMarkRecovered={async (cartId) => {
          await updateCartStatus(cartId, 'recovered');
          setIsCartDetailsOpen(false);
        }}
      />
    </div>
  );
}