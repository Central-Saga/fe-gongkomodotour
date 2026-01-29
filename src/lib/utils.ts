import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatDate(dateString: string) {
  const date = new Date(dateString)
  return new Intl.DateTimeFormat('id-ID', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  }).format(date)
}

/** Display trip price: "By Request" when by_request or null, else formatted IDR. Backward compat: missing price_type treated as fixed. */
export function formatTripPriceDisplay(price: { price_type?: "fixed" | "by_request"; price_per_pax?: number | null } | null | undefined): string {
  if (!price) return "By Request"
  const type = price.price_type ?? "fixed"
  if (type === "by_request" || price.price_per_pax == null) return "By Request"
  return new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR" }).format(Number(price.price_per_pax))
}
