"use client";
import React, { createContext, useContext, ReactNode } from "react";

interface ShopContextType {
  shopId: string | null;
}

const ShopContext = createContext<ShopContextType>({ shopId: null });

export const useShop = () => useContext(ShopContext);

interface ShopProviderProps {
  shopId: string;
  children: ReactNode;
}

export const ShopProvider = ({ shopId, children }: ShopProviderProps) => (
  <ShopContext.Provider value={{ shopId }}>
    {children}
  </ShopContext.Provider>
); 