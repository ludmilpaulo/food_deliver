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
    picked_up: "Picked Up",
    handed_to_driver: "Handed to Driver",
    delivered: "Delivered",
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

export function inventoryLabel(status?: string): string {
  if (status === "low_stock") return "Low Stock";
  if (status === "out_of_stock") return "Out of Stock";
  return "In Stock";
}
