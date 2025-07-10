import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Utility to get the current user's shop_id from Supabase Auth user_metadata
export async function getCurrentShopId(supabase: any) {
  const { data: userData, error: userError } = await supabase.auth.getUser();
  console.log('[DEBUG] userData:', userData, 'userError:', userError);
  if (userError || !userData?.user) {
    throw new Error("User not authenticated");
  }
  const userId = userData.user.id;
  console.log('[DEBUG] userId:', userId);

  const { data: shops, error: shopError } = await supabase
    .from('shops')
    .select('id, owner_id')
    .eq('owner_id', userId)
    .limit(1);

  console.log('[DEBUG] shops query result:', shops, 'shopError:', shopError);

  if (shopError) {
    throw new Error("Error fetching shop: " + shopError.message);
  }
  if (!shops || shops.length === 0) {
    throw new Error("No shop found for this user");
  }
  return shops[0].id;
}
