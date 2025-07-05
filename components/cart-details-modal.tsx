"use client";

import * as React from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent } from "@/components/ui/card";
import { RefreshCw, CheckCircle, AlertCircle } from "lucide-react";

interface CartItem {
  title: string;
  image_url?: string;
  price?: number;
  quantity?: number;
}

interface CartDetailsModalProps {
  cart: {
    id: string;
    shopify_cart_id: string;
    customer_email: string;
    total_price: number;
    currency: string;
    line_items: CartItem[];
    created_at: string;
    status: string;
    customer?: {
      name: string;
      email: string;
    };
  } | null;
  isOpen: boolean;
  onClose: () => void;
  onMarkRecovered: (cartId: string) => Promise<void>;
}

const formatCurrency = (amount: number, currency: string) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency || 'USD'
  }).format(amount)
}

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

const getStatusColor = (status: string) => {
  const colors = {
    abandoned: "secondary",
    email_sent: "outline", 
    recovered: "default",
    pending: "secondary",
  } as const;
  return colors[status as keyof typeof colors] || "secondary";
};

export function CartDetailsModal({ 
  cart, 
  isOpen, 
  onClose, 
  onMarkRecovered 
}: CartDetailsModalProps) {
  const [isMarkingRecovered, setIsMarkingRecovered] = React.useState(false);
  const [imageErrors, setImageErrors] = React.useState<Set<string>>(new Set());

  const handleImageError = (imageUrl: string) => {
    setImageErrors(prev => new Set(prev).add(imageUrl));
  };

  React.useEffect(() => {
    if (!isOpen) {
      setImageErrors(new Set());
      setIsMarkingRecovered(false);
    }
  }, [isOpen]);

  const handleMarkRecovered = async () => {
    if (!cart) return;
    try {
      setIsMarkingRecovered(true);
      await onMarkRecovered(cart.id);
      onClose();
    } catch (error) {
      console.error('Failed to mark cart as recovered:', error);
    } finally {
      setIsMarkingRecovered(false);
    }
  };

  if (!cart) return null;

  const customerName = cart.customer?.name || cart.customer_email || 'Unknown Customer';
  const totalItems = cart.line_items?.reduce((sum, item) => sum + (item.quantity || 1), 0) || 0;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Avatar className="h-8 w-8">
              <AvatarImage src="/placeholder.svg" alt={customerName} />
              <AvatarFallback>
                {customerName
                  .split("@")[0]
                  .split(" ")
                  .map((n) => n[0])
                  .join("")}
              </AvatarFallback>
            </Avatar>
            Cart Details - {customerName}
          </DialogTitle>
          <DialogDescription>
            Cart ID: {cart.shopify_cart_id} • Created: {formatDate(cart.created_at)}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Customer Information */}
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-semibold">{customerName}</h3>
                  <p className="text-sm text-muted-foreground">{cart.customer_email}</p>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold">
                    {formatCurrency(cart.total_price, cart.currency)}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {totalItems} item{totalItems !== 1 ? 's' : ''} total
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Cart Items */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Cart Items</h3>
            {!cart.line_items || cart.line_items.length === 0 ? (
              <Card>
                <CardContent className="pt-6">
                  <div className="text-center text-muted-foreground py-8">
                    <AlertCircle className="h-8 w-8 mx-auto mb-2" />
                    <p>No items found in this cart</p>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-4">
                {cart.line_items.map((item, index) => {
                  const hasImageError = imageErrors.has(item.image_url || '');
                  const quantity = item.quantity || 1;
                  const price = item.price || 0;
                  const itemTotal = price * quantity;
                  return (
                    <Card key={index} className="overflow-hidden">
                      <CardContent className="p-0">
                        <div className="flex">
                          <div className="w-24 h-24 flex-shrink-0">
                            {item.image_url && !hasImageError ? (
                              <img
                                src={item.image_url}
                                alt={item.title}
                                className="w-full h-full object-cover"
                                loading="lazy"
                                onError={() => handleImageError(item.image_url!)}
                              />
                            ) : (
                              <div className="w-full h-full bg-muted flex items-center justify-center">
                                <span className="text-xs text-muted-foreground text-center px-2">
                                  No Image
                                </span>
                              </div>
                            )}
                          </div>
                          <div className="flex-1 p-4">
                            <div className="flex justify-between items-start">
                              <div className="flex-1">
                                <h4 className="font-medium">{item.title}</h4>
                                <div className="flex items-center gap-2 mt-1">
                                  <span className="text-sm text-muted-foreground">
                                    Qty: {quantity}
                                  </span>
                                  {price > 0 && (
                                    <>
                                      <span className="text-sm text-muted-foreground">•</span>
                                      <span className="text-sm">
                                        {formatCurrency(price, cart.currency)} each
                                      </span>
                                    </>
                                  )}
                                </div>
                              </div>
                              <div className="text-right">
                                <div className="font-medium">
                                  {formatCurrency(itemTotal, cart.currency)}
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            )}
          </div>

          {/* Cart Status and Actions */}
          <div className="flex items-center justify-between pt-4 border-t">
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">Status:</span>
              <Badge variant={getStatusColor(cart.status)}>
                {cart.status.replace("_", " ")}
              </Badge>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={onClose}>
                Close
              </Button>
              {cart.status !== 'recovered' && (
                <Button
                  onClick={handleMarkRecovered}
                  disabled={isMarkingRecovered}
                  className="bg-green-600 hover:bg-green-700"
                >
                  {isMarkingRecovered ? (
                    <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <CheckCircle className="mr-2 h-4 w-4" />
                  )}
                  Mark as Recovered
                </Button>
              )}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
} 