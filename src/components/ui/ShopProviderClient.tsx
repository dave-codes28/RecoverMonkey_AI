"use client";
import React from "react";
import { ShopProvider } from "@/context/ShopContext";

interface ShopProviderClientProps {
  shopId: string;
  children: React.ReactNode;
}

export default function ShopProviderClient({ shopId, children }: ShopProviderClientProps) {
  return <ShopProvider shopId={shopId}>{children}</ShopProvider>;
}
