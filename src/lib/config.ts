export function isSupabaseConfigured(): boolean {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  return Boolean(url && key && !url.includes("your-project"));
}

export const COINS_EARN_RATE = 0.05; // 5% of order total credited as coins
export const REFERRAL_BONUS = 50; // coins for referrer and referee
export const COIN_VALUE = 1; // 1 coin = ₹1 on redeem
export const DELIVERY_EARNING_PER_ORDER = 25; // ₹ earned by delivery boy per completed delivery
