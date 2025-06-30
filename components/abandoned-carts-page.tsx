"use client"

import * as React from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Search, MoreHorizontal, Eye, Mail, MessageSquare, RefreshCw } from "lucide-react"

interface AbandonedCart {
  id: string;
  shopify_cart_id: string;
  shopify_customer_id: string;
  email: string;
  total_price: number;
  currency: string;
  items: any[];
  created_at: string;
  status: string;
  metadata: any;
}

const statusColors = {
  abandoned: "secondary",
  email_sent: "outline",
  recovered: "default",
  pending: "secondary",
} as const

export function AbandonedCartsPage() {
  const [searchTerm, setSearchTerm] = React.useState("")
  const [statusFilter, setStatusFilter] = React.useState("all")
  const [carts, setCarts] = React.useState<AbandonedCart[]>([])
  const [loading, setLoading] = React.useState(true)
  const [error, setError] = React.useState<string | null>(null)

  const fetchCarts = async () => {
    try {
      setLoading(true)
      setError(null)

      console.log('[Frontend] Fetching carts from API...');
      const response = await fetch('/api/carts');
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to fetch carts');
      }

      const data = await response.json();
      console.log('[Frontend] Received carts:', data.carts?.length || 0);
      setCarts(data.carts || []);
    } catch (err) {
      console.error('[Frontend] Error fetching carts:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch abandoned carts');
    } finally {
      setLoading(false)
    }
  }

  const updateCartStatus = async (cartId: string, status: string) => {
    try {
      console.log('[Frontend] Updating cart status:', { cartId, status });
      
      const response = await fetch('/api/carts', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ cartId, status }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to update cart');
      }

      // Refresh the carts list
      await fetchCarts();
    } catch (err) {
      console.error('[Frontend] Error updating cart status:', err);
      throw err;
    }
  }

  React.useEffect(() => {
    fetchCarts()
  }, [])

  const filteredCarts = carts.filter((cart) => {
    const customerName = cart.email || 'Unknown Customer' // Use email as customer name for now
    const matchesSearch =
      customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      cart.email.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = statusFilter === "all" || cart.status === statusFilter
    return matchesSearch && matchesStatus
  })

  const formatCurrency = (amount: number, currency: string) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency || 'USD'
    }).format(amount)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  const getProductNames = (items: any[]) => {
    if (!items || items.length === 0) return ['No items']
    return items.map(item => item.title || 'Unknown Product').slice(0, 3)
  }

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
    )
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
    )
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Abandoned Carts</h2>
          <p className="text-muted-foreground">Manage and recover abandoned shopping carts</p>
        </div>
        <Button onClick={fetchCarts} variant="outline">
          <RefreshCw className="mr-2 h-4 w-4" />
          Refresh
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
                  placeholder="Search by customer email..."
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
                    const customerName = cart.email || 'Unknown Customer'
                    const productNames = getProductNames(cart.items)
                    
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
                          <div className="font-medium">{cart.items?.length || 0} items</div>
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
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" className="h-8 w-8 p-0 hover:bg-muted">
                                <span className="sr-only">Open menu</span>
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="shadow-lg">
                              <DropdownMenuLabel>Actions</DropdownMenuLabel>
                              <DropdownMenuItem>
                                <Eye className="mr-2 h-4 w-4" />
                                View Details
                              </DropdownMenuItem>
                              <DropdownMenuItem>
                                <Mail className="mr-2 h-4 w-4" />
                                Send Recovery Email
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
                        </TableCell>
                      </TableRow>
                    )
                  })
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
