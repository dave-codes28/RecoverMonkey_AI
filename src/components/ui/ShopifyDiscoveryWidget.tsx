"use client";

import React, { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { 
  Search, 
  Download, 
  RefreshCw, 
  Users, 
  ShoppingCart, 
  Package,
  CheckCircle,
  AlertCircle,
  Loader2
} from "lucide-react";

interface DiscoveryResults {
  store?: {
    name: string;
    domain: string;
    email: string;
    currency: string;
  };
  counts?: {
    products: number;
    customers: number;
    orders: number;
    abandonedCheckouts: number;
  };
  results?: {
    products: { count: number; synced: number };
    abandoned_checkouts: { count: number; synced: number };
    orders: { count: number; synced: number };
    customers: { count: number; synced: number };
  };
}

export function ShopifyDiscoveryWidget() {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [discoveryData, setDiscoveryData] = useState<DiscoveryResults | null>(null);
  const [lastSync, setLastSync] = useState<string | null>(null);

  const discoverStore = async () => {
    try {
      setLoading(true);
      
      const response = await fetch('/api/shopify/discover-store?shop_id=d5a79116-842f-4a4b-afd6-a4bb225119cf');
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      setDiscoveryData(data);
      
      toast({
        title: "Store Discovery Complete",
        description: `Analyzed ${data.store?.name || 'your store'} with ${data.counts?.products || 0} products`,
      });
      
    } catch (error) {
      console.error('Discovery error:', error);
      toast({
        title: "Discovery Failed",
        description: error instanceof Error ? error.message : "Failed to discover store",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const syncData = async (syncType: string = 'all') => {
    try {
      setLoading(true);
      
      const response = await fetch('/api/shopify/discover-store', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          shop_id: 'd5a79116-842f-4a4b-afd6-a4bb225119cf',
          sync_type: syncType
        }),
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      setDiscoveryData(prev => ({ ...prev, results: data.results }));
      setLastSync(new Date().toLocaleString());
      
      const syncedCount = Object.values(data.results).reduce((total: number, item: any) => total + item.synced, 0);
      
      toast({
        title: "Data Sync Complete",
        description: `Synced ${syncedCount} items from your Shopify store`,
      });
      
    } catch (error) {
      console.error('Sync error:', error);
      toast({
        title: "Sync Failed",
        description: error instanceof Error ? error.message : "Failed to sync data",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Search className="h-5 w-5" />
          Shopify Store Discovery
        </CardTitle>
        <CardDescription>
          Analyze your Shopify store and sync live data with full metadata
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Store Info */}
        {discoveryData?.store && (
          <div className="p-4 bg-blue-50 dark:bg-blue-950/20 rounded-lg">
            <h4 className="font-semibold text-blue-900 dark:text-blue-100 mb-2">
              {discoveryData.store.name}
            </h4>
            <div className="grid grid-cols-2 gap-2 text-sm text-blue-700 dark:text-blue-300">
              <div>Domain: {discoveryData.store.domain}</div>
              <div>Currency: {discoveryData.store.currency}</div>
            </div>
          </div>
        )}

        {/* Data Counts */}
        {discoveryData?.counts && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center p-3 bg-green-50 dark:bg-green-950/20 rounded-lg">
              <Package className="h-6 w-6 mx-auto mb-1 text-green-600" />
              <div className="text-lg font-semibold text-green-900 dark:text-green-100">
                {discoveryData.counts.products}
              </div>
              <div className="text-xs text-green-700 dark:text-green-300">Products</div>
            </div>
            <div className="text-center p-3 bg-blue-50 dark:bg-blue-950/20 rounded-lg">
              <Users className="h-6 w-6 mx-auto mb-1 text-blue-600" />
              <div className="text-lg font-semibold text-blue-900 dark:text-blue-100">
                {discoveryData.counts.customers}
              </div>
              <div className="text-xs text-blue-700 dark:text-blue-300">Customers</div>
            </div>
            <div className="text-center p-3 bg-purple-50 dark:bg-purple-950/20 rounded-lg">
              <CheckCircle className="h-6 w-6 mx-auto mb-1 text-purple-600" />
              <div className="text-lg font-semibold text-purple-900 dark:text-purple-100">
                {discoveryData.counts.orders}
              </div>
              <div className="text-xs text-purple-700 dark:text-purple-300">Orders</div>
            </div>
            <div className="text-center p-3 bg-orange-50 dark:bg-orange-950/20 rounded-lg">
              <ShoppingCart className="h-6 w-6 mx-auto mb-1 text-orange-600" />
              <div className="text-lg font-semibold text-orange-900 dark:text-orange-100">
                {discoveryData.counts.abandonedCheckouts}
              </div>
              <div className="text-xs text-orange-700 dark:text-orange-300">Abandoned</div>
            </div>
          </div>
        )}

        {/* Sync Results */}
        {discoveryData?.results && (
          <div className="space-y-2">
            <h4 className="font-semibold">Sync Results:</h4>
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div className="flex justify-between">
                <span>Products:</span>
                <Badge variant="outline">
                  {discoveryData.results.products.synced}/{discoveryData.results.products.count}
                </Badge>
              </div>
              <div className="flex justify-between">
                <span>Customers:</span>
                <Badge variant="outline">
                  {discoveryData.results.customers.synced}/{discoveryData.results.customers.count}
                </Badge>
              </div>
              <div className="flex justify-between">
                <span>Checkouts:</span>
                <Badge variant="outline">
                  {discoveryData.results.abandoned_checkouts.synced}/{discoveryData.results.abandoned_checkouts.count}
                </Badge>
              </div>
              <div className="flex justify-between">
                <span>Orders:</span>
                <Badge variant="outline">
                  {discoveryData.results.orders.synced}/{discoveryData.results.orders.count}
                </Badge>
              </div>
            </div>
          </div>
        )}

        {/* Last Sync */}
        {lastSync && (
          <div className="text-sm text-muted-foreground">
            Last synced: {lastSync}
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex flex-wrap gap-2">
          <Button 
            onClick={discoverStore} 
            disabled={loading}
            variant="outline"
            size="sm"
          >
            {loading ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <Search className="h-4 w-4 mr-2" />
            )}
            Discover Store
          </Button>
          
          <Button 
            onClick={() => syncData('all')} 
            disabled={loading}
            size="sm"
          >
            {loading ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <Download className="h-4 w-4 mr-2" />
            )}
            Sync All Data
          </Button>
          
          <Button 
            onClick={() => syncData('checkouts')} 
            disabled={loading}
            variant="outline"
            size="sm"
          >
            {loading ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <ShoppingCart className="h-4 w-4 mr-2" />
            )}
            Sync Checkouts
          </Button>
          
          <Button 
            onClick={() => syncData('customers')} 
            disabled={loading}
            variant="outline"
            size="sm"
          >
            {loading ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <Users className="h-4 w-4 mr-2" />
            )}
            Sync Customers
          </Button>
        </div>

        {/* Status */}
        {loading && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin" />
            Processing...
          </div>
        )}
      </CardContent>
    </Card>
  );
} 