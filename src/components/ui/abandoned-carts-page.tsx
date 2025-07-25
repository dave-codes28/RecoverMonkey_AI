"use client";

import * as React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { DropdownMenu, DropdownMenuContent, DropdownMenuLabel, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Skeleton } from "@/components/ui/skeleton";
import { Search, MoreHorizontal, Eye, Mail, MessageSquare, RefreshCw, ShoppingCart, DollarSign, Target, Inbox } from "lucide-react";
import { CartDetailsModal } from "./cart-details-modal"; // Assuming this component exists
import { useToast } from "@/hooks/use-toast"; // Assuming this hook exists

// Interface remains the same
interface AbandonedCart {
  id: string;
  shopify_cart_id: string;
  shopify_customer_id: string;
  customer_email: string;
  total_price: number;
  currency: string;
  line_items: any[];
  created_at: string;
  status: 'abandoned' | 'email_sent' | 'recovered' | 'pending'; // Explicitly define possible statuses
  metadata: any;
  customer_id?: string;
  customer?: {
    id: string;
    name: string;
    email: string;
    shopify_customer_id: string;
  };
}

// New, more descriptive status colors
const statusConfig = {
  abandoned: { variant: "secondary", className: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/50 dark:text-yellow-300 border-yellow-300/50" },
  email_sent: { variant: "secondary", className: "bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-300 border-blue-300/50" },
  recovered: { variant: "secondary", className: "bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300 border-green-300/50" },
  pending: { variant: "secondary", className: "bg-gray-100 text-gray-800 dark:bg-gray-900/50 dark:text-gray-300 border-gray-300/50" },
} as const;


// --- Mock Data for Simulation ---
const mockCarts: AbandonedCart[] = [
  {
    id: "cart_001",
    shopify_cart_id: "shc_12345",
    shopify_customer_id: "shc_cust_001",
    customer_email: "alice@example.com",
    total_price: 120.50,
    currency: "USD",
    line_items: [{ id: "item1", title: "Product A", quantity: 1, price: 50.00 }, { id: "item2", title: "Product B", quantity: 2, price: 35.25 }],
    created_at: "2025-07-15T10:00:00Z",
    status: "abandoned",
    metadata: {},
    customer: { id: "cust_001", name: "Alice Smith", email: "alice@example.com", shopify_customer_id: "shc_cust_001" },
  },
  {
    id: "cart_002",
    shopify_cart_id: "shc_12346",
    shopify_customer_id: "shc_cust_002",
    customer_email: "bob@example.com",
    total_price: 55.00,
    currency: "USD",
    line_items: [{ id: "item3", title: "Product C", quantity: 1, price: 55.00 }],
    created_at: "2025-07-14T14:30:00Z",
    status: "email_sent",
    metadata: {},
    customer: { id: "cust_002", name: "Bob Johnson", email: "bob@example.com", shopify_customer_id: "shc_cust_002" },
  },
  {
    id: "cart_003",
    shopify_cart_id: "shc_12347",
    shopify_customer_id: "shc_cust_003",
    customer_email: "charlie@example.com",
    total_price: 250.75,
    currency: "USD",
    line_items: [{ id: "item4", title: "Product D", quantity: 3, price: 80.25 }, { id: "item5", title: "Product E", quantity: 1, price: 10.00 }],
    created_at: "2025-07-13T09:15:00Z",
    status: "recovered",
    metadata: {},
    customer: { id: "cust_003", name: "Charlie Brown", email: "charlie@example.com", shopify_customer_id: "shc_cust_003" },
  },
  {
    id: "cart_004",
    shopify_cart_id: "shc_12348",
    shopify_customer_id: "shc_cust_004",
    customer_email: "diana@example.com",
    total_price: 30.00,
    currency: "EUR",
    line_items: [{ id: "item6", title: "Product F", quantity: 1, price: 30.00 }],
    created_at: "2025-07-12T11:00:00Z",
    status: "abandoned",
    metadata: {},
    customer: { id: "cust_004", name: "Diana Prince", email: "diana@example.com", shopify_customer_id: "shc_cust_004" },
  },
  {
    id: "cart_005",
    shopify_cart_id: "shc_12349",
    shopify_customer_id: "shc_cust_005",
    customer_email: "eve@example.com",
    total_price: 99.99,
    currency: "GBP",
    line_items: [{ id: "item7", title: "Product G", quantity: 1, price: 99.99 }],
    created_at: "2025-07-11T16:45:00Z",
    status: "pending",
    metadata: {},
    customer: { id: "cust_005", name: "Eve Adams", email: "eve@example.com", shopify_customer_id: "shc_cust_005" },
  },
];


export function AbandonedCartsPage() {
  const { toast } = useToast();
  // State management remains the same
  const [searchTerm, setSearchTerm] = React.useState("");
  const [statusFilter, setStatusFilter] = React.useState("all");
  const [carts, setCarts] = React.useState<AbandonedCart[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [sendingEmailCartId, setSendingEmailCartId] = React.useState<string | null>(null);
  const [syncingCarts, setSyncingCarts] = React.useState(false); // State for sync button loading
  const [selectedCart, setSelectedCart] = React.useState<AbandonedCart | null>(null);
  const [isCartDetailsOpen, setIsCartDetailsOpen] = React.useState(false);

  // Function to fetch carts (simulated API call)
  const fetchCarts = React.useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch('/api/carts');
      if (!response.ok) throw new Error('Failed to fetch carts');
      const data = await response.json();
      setCarts(data.carts || []);
      toast({
        title: "Carts Loaded",
        description: "Abandoned cart data has been successfully fetched.",
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load abandoned carts. Please try again.');
      toast({
        title: "Error",
        description: "Failed to load carts. " + (err instanceof Error ? err.message : "An unknown error occurred."),
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [toast]); // Add toast to dependencies

  // Function to update cart status (simulated API call)
  const updateCartStatus = async (cartId: string, newStatus: AbandonedCart['status']) => {
    setLoading(true); // Set loading while updating status
    try {
      // Simulate API call delay
      await new Promise((resolve) => setTimeout(resolve, 800));
      setCarts((prevCarts) =>
        prevCarts.map((cart) =>
          cart.id === cartId ? { ...cart, status: newStatus } : cart
        )
      );
      toast({
        title: "Cart Updated",
        description: `Cart ${cartId} status updated to '${newStatus.replace("_", " ")}'.`,
      });
    } catch (err) {
      console.error("Failed to update cart status:", err);
      toast({
        title: "Error",
        description: `Failed to update status for cart ${cartId}.`,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // Function to send recovery email (simulated API call)
  const sendRecoveryEmail = async (cartId: string, shopifyCartId: string) => {
    setSendingEmailCartId(cartId);
    try {
      const res = await fetch('/api/email/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ cart_id: shopifyCartId }),
      });
      const data = await res.json();
      if (res.ok) {
        updateCartStatus(cartId, 'email_sent');
        toast({
          title: 'Email Sent',
          description: `Recovery email for cart ${cartId} sent successfully!`,
        });
      } else {
        throw new Error(data.error || 'Failed to send recovery email');
      }
    } catch (err) {
      toast({
        title: 'Error',
        description: `Failed to send recovery email for cart ${cartId}. ${err instanceof Error ? err.message : ''}`,
        variant: 'destructive',
      });
    } finally {
      setSendingEmailCartId(null);
    }
  };

  // Function to handle syncing abandoned carts (simulated API call)
  const handleSyncAbandonedCarts = async () => {
    setSyncingCarts(true);
    try {
      // Simulate API call delay and fetching new carts
      await new Promise((resolve) => setTimeout(resolve, 2500));
      const newCarts: AbandonedCart[] = [
        ...mockCarts,
        {
          id: "cart_006",
          shopify_cart_id: "shc_12350",
          shopify_customer_id: "shc_cust_006",
          customer_email: "frank@example.com",
          total_price: 75.00,
          currency: "USD",
          line_items: [{ id: "item8", title: "Product H", quantity: 1, price: 75.00 }],
          created_at: "2025-07-19T08:00:00Z",
          status: "abandoned" as "abandoned", // Explicitly type as allowed value
          metadata: {},
          customer: { id: "cust_006", name: "Frank Green", email: "frank@example.com", shopify_customer_id: "shc_cust_006" },
        },
      ];
      setCarts(newCarts); // Update with "newly synced" carts
      toast({
        title: "Sync Complete",
        description: "Abandoned carts have been synchronized with your store.",
      });
    } catch (err) {
      console.error("Failed to sync carts:", err);
      toast({
        title: "Error",
        description: "Failed to sync carts. " + (err instanceof Error ? err.message : "An unknown error occurred."),
        variant: "destructive",
      });
    } finally {
      setSyncingCarts(false);
    }
  };

  // Existing utility functions
  const formatCurrency = (amount: number, currency: string) => {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: currency || 'USD' }).format(amount);
  };
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };
  const getProductNames = (items: any[]) => {
    if (!items || items.length === 0) return ['No items'];
    return items.map((item) => {
      if (typeof item === 'string') return item;
      if (item && typeof item === 'object') return item.title || item.name || item.product_title || 'Unknown Product';
      return 'Unknown Product';
    }).slice(0, 3);
  };


  React.useEffect(() => {
    fetchCarts();
  }, [fetchCarts]); // Depend on fetchCarts to ensure it's called once on mount

  const filteredCarts = carts.filter((cart) => {
    const customerName = cart.customer?.name || cart.customer_email || 'Unknown Customer';
    const customerEmail = cart.customer?.email || cart.customer_email || '';
    const matchesSearch =
      customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      customerEmail.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "all" || cart.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  // Calculate stats for the new header
  const stats = React.useMemo(() => {
    const recoverableValue = carts
      .filter(c => c.status !== 'recovered')
      .reduce((sum, cart) => sum + cart.total_price, 0);
    const recoveredCount = carts.filter(c => c.status === 'recovered').length;
    const recoveryRate = carts.length > 0 ? (recoveredCount / carts.length) * 100 : 0;
    return {
      recoverableValue,
      recoveredCount,
      recoveryRate: recoveryRate.toFixed(1),
      defaultCurrency: carts.length > 0 ? carts[0].currency : 'USD'
    };
  }, [carts]);

  // Loading State with Skeletons
  if (loading) {
    return <DashboardSkeleton />;
  }

  // Error State remains largely the same, but within the new layout
  if (error) {
    return (
      <div className="flex flex-col gap-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Abandoned Carts</h1>
          <p className="text-muted-foreground">Error loading data. Please try again.</p>
        </div>
        <Card className="border-destructive">
          <CardContent className="pt-6 flex flex-col items-center gap-4 text-destructive">
              <p>Error: {error}</p>
            <Button onClick={fetchCarts} variant="destructive">
                <RefreshCw className="mr-2 h-4 w-4" />
                Retry
              </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // --- Main Upgraded Component ---
  return (
    <TooltipProvider>
      <div className="flex flex-col gap-8">
        {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
            <h1 className="text-3xl font-bold tracking-tight">Abandoned Carts</h1>
            <p className="text-muted-foreground">Manage and recover abandoned shopping carts.</p>
        </div>
        <Button
            onClick={handleSyncAbandonedCarts}
            className="bg-green-600 hover:bg-green-700 text-white shadow-sm"
            disabled={syncingCarts} // Disable button during sync
          >
            {syncingCarts ? (
              <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <RefreshCw className="mr-2 h-4 w-4" />
            )}
            {syncingCarts ? "Syncing..." : "Sync Carts"}
        </Button>
      </div>

        {/* --- 1. Dashboard Stats Header --- */}
        <div className="grid gap-4 md:grid-cols-3">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Recoverable Value</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatCurrency(stats.recoverableValue, stats.defaultCurrency)}</div>
              <p className="text-xs text-muted-foreground">Potential revenue from open carts</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Carts Recovered</CardTitle>
              <ShoppingCart className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">+{stats.recoveredCount}</div>
              <p className="text-xs text-muted-foreground">Successfully recovered carts</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Recovery Rate</CardTitle>
              <Target className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
              <div className="text-2xl font-bold">{stats.recoveryRate}%</div>
              <p className="text-xs text-muted-foreground">Of all processed carts</p>
            </CardContent>
          </Card>
        </div>

        {/* --- 2. Carts Table with Integrated Toolbar --- */}
        <Card>
          <CardHeader>
            <CardTitle>All Carts ({filteredCarts.length})</CardTitle>
            <CardDescription>A list of all abandoned carts from your store.</CardDescription>
            <div className="flex flex-col gap-4 pt-4 md:flex-row md:items-center">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search by customer name or email..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-full md:w-[180px]">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="abandoned">Abandoned</SelectItem>
                <SelectItem value="email_sent">Email Sent</SelectItem>
                <SelectItem value="recovered">Recovered</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem> {/* Added pending to filter options */}
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto max-h-[500px] overflow-y-auto"> {/* Fixed height and scroll for desktop */}
            <Table>
              <TableHeader>
                  <TableRow>
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
                      <TableCell colSpan={6} className="h-48 text-center">
                        <div className="flex flex-col items-center gap-2">
                          <Inbox className="h-12 w-12 text-muted-foreground/50" />
                          <h3 className="font-semibold">No carts found</h3>
                          <p className="text-muted-foreground">Try adjusting your filters or sync with your store.</p>
                        </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredCarts.map((cart) => {
                      const customerName = cart.customer?.name || cart.customer_email || 'Unknown';
                    const productNames = getProductNames(cart.line_items);
                      const statusInfo = statusConfig[cart.status as keyof typeof statusConfig] || statusConfig.pending;
                    
                    return (
                        // --- 3. Enhanced Table Row ---
                        <TableRow key={cart.id} className="odd:bg-muted/50">
                          <TableCell className="font-medium">
                            <div className="flex items-center gap-3">
                              <Avatar className="h-9 w-9">
                                <AvatarImage src={`https://avatar.vercel.sh/${cart.customer_email}.png`} alt={customerName} />
                                <AvatarFallback>{customerName.charAt(0).toUpperCase()}</AvatarFallback>
                            </Avatar>
                            <div>
                                <div className="font-semibold">{customerName}</div>
                                <div className="text-xs text-muted-foreground">{cart.customer_email}</div>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                            <div>{cart.line_items?.length || 0} items</div>
                            <div className="text-xs text-muted-foreground truncate max-w-[200px]">
                            {productNames.slice(0, 2).join(", ")}
                            {productNames.length > 2 && "..."}
                          </div>
                        </TableCell>
                          <TableCell className="font-semibold">{formatCurrency(cart.total_price, cart.currency)}</TableCell>
                        <TableCell>{formatDate(cart.created_at)}</TableCell>
                        <TableCell>
                            <Badge variant={statusInfo.variant} className={statusInfo.className}>
                            {cart.status.replace("_", " ")}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                            <div className="flex items-center justify-end gap-2">
                              <Tooltip>
                                <TooltipTrigger asChild>
                            <Button
                              variant="outline"
                                    size="icon"
                                    className="h-8 w-8"
                                    disabled={sendingEmailCartId === cart.id || cart.status === 'recovered'} // Disable if already recovered
                                    onClick={() => sendRecoveryEmail(cart.id, cart.shopify_cart_id)} // Call the send email function
                            >
                              {sendingEmailCartId === cart.id ? (
                                      <RefreshCw className="h-4 w-4 animate-spin" />
                              ) : (
                                      <Mail className="h-4 w-4" />
                              )}
                            </Button>
                                </TooltipTrigger>
                                <TooltipContent>Send Recovery Email</TooltipContent>
                              </Tooltip>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                  <Button variant="ghost" className="h-8 w-8 p-0">
                                <span className="sr-only">Open menu</span>
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                              <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                  <DropdownMenuItem onClick={() => { setSelectedCart(cart); setIsCartDetailsOpen(true); }}>
                                    <Eye className="mr-2 h-4 w-4" /> View Details
                              </DropdownMenuItem>
                              <DropdownMenuItem>
                                    <MessageSquare className="mr-2 h-4 w-4" /> Chat with Customer
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem 
                                onClick={() => updateCartStatus(cart.id, 'recovered')}
                                    className="text-green-600 focus:text-green-600"
                                    disabled={cart.status === 'recovered'} // Disable if already recovered
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

        {/* Modal remains the same */}
      <CartDetailsModal
        cart={selectedCart}
        isOpen={isCartDetailsOpen}
        onClose={() => setIsCartDetailsOpen(false)}
          onMarkRecovered={async (cartId) => { await updateCartStatus(cartId, 'recovered'); setIsCartDetailsOpen(false); }}
      />
    </div>
    </TooltipProvider>
  );
}

// --- 4. Skeleton Component for Loading State ---
const DashboardSkeleton = () => (
  <div className="flex flex-col gap-8">
    {/* Header Skeleton */}
    <div className="flex items-center justify-between">
      <div>
        <Skeleton className="h-8 w-64 rounded-md" />
        <Skeleton className="mt-2 h-4 w-80 rounded-md" />
      </div>
      <Skeleton className="h-10 w-36 rounded-md" />
    </div>
    {/* Stats Skeleton */}
    <div className="grid gap-4 md:grid-cols-3">
      <Card><CardHeader><Skeleton className="h-5 w-3/4" /></CardHeader><CardContent><Skeleton className="h-7 w-1/2" /><Skeleton className="mt-2 h-3 w-full" /></CardContent></Card>
      <Card><CardHeader><Skeleton className="h-5 w-3/4" /></CardHeader><CardContent><Skeleton className="h-7 w-1/2" /><Skeleton className="mt-2 h-3 w-full" /></CardContent></Card>
      <Card><CardHeader><Skeleton className="h-5 w-3/4" /></CardHeader><CardContent><Skeleton className="h-7 w-1/2" /><Skeleton className="mt-2 h-3 w-full" /></CardContent></Card>
    </div>
    {/* Table Skeleton */}
    <Card>
      <CardHeader>
        <Skeleton className="h-6 w-48 rounded-md" />
        <Skeleton className="mt-2 h-4 w-72 rounded-md" />
        <div className="flex items-center gap-4 pt-4">
          <Skeleton className="h-10 flex-1 rounded-md" />
          <Skeleton className="h-10 w-[180px] rounded-md" />
        </div>
      </CardHeader>
      <CardContent className="p-0">
        <div className="p-6 space-y-4">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="flex items-center gap-4">
              <Skeleton className="h-9 w-9 rounded-full" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-4 w-1/4" />
                <Skeleton className="h-4 w-1/2" /> {/* Adjusted width for better skeleton representation */}
              </div>
              <Skeleton className="h-4 w-1/6" />
              <Skeleton className="h-4 w-1/6" />
              <Skeleton className="h-4 w-1/6" />
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  </div>
);
  