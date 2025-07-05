"use client";
import { ShopProvider } from "@/context/ShopContext";
 
export default function ShopProviderClient({ shopId, children }: { shopId: string, children: React.ReactNode }) {
  return <ShopProvider shopId={shopId}>{children}</ShopProvider>;
} 