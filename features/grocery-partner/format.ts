export function greetingForNow(date = new Date()): string {
  const hour = date.getHours();
  if (hour < 12) return "Good morning";
  if (hour < 18) return "Good afternoon";
  return "Good evening";
}

export function formatMoney(value: number | string | undefined, currency = "R"): string {
  const amount = Number(value || 0);
  return `${currency}${amount.toLocaleString("en-ZA", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

export function formatChange(value: number | undefined): string {
  const amount = Number(value || 0);
  const sign = amount > 0 ? "+" : "";
  return `${sign}${amount.toFixed(1)}% vs yesterday`;
}

export function unitLabel(unit?: string): string {
  return (unit || "item").replace("millilitre", "ml");
}

export function groceryStatusLabel(status?: string): string {
  const labels: Record<string, string> = {
    new: "New",
    accepted: "Accepted",
    preparing: "Preparing",
    ready: "Ready",
    packed: "Packed",
    picked_up: "Picked Up",
    handed_to_driver: "Handed to Driver",
    courier_assigned: "Courier assigned",
    out_for_delivery: "Out for delivery",
    delivered: "Delivered",
    completed: "Completed",
    cancelled: "Cancelled",
    refunded: "Refunded",
    PROCESSANDO: "New",
    "Pedido Pronto": "Ready",
    "A caminho": "Picked Up",
    Entregue: "Delivered",
    Rejeitado: "Cancelled",
  };
  return labels[status || ""] || status || "New";
}

const WEIGHT_UNITS = new Set(["kg", "gram", "litre", "millilitre"]);

export function allowsFractional(unit?: string): boolean {
  return WEIGHT_UNITS.has((unit || "").toLowerCase());
}

export function partnerStatus(product: {
  is_active: boolean;
  approval_status: string;
  inventory_status: string;
}): string {
  if (!product.is_active) return "inactive";
  if (product.approval_status === "draft") return "draft";
  if (product.approval_status && product.approval_status !== "approved") return "pending_approval";
  return product.inventory_status;
}

export function inventoryLabel(status?: string): string {
  if (status === "low_stock") return "Low Stock";
  if (status === "out_of_stock") return "Out of Stock";
  return "In Stock";
}
