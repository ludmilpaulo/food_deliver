import { formatChange, formatMoney, groceryStatusLabel, inventoryLabel, unitLabel } from "@/features/grocery-partner/format";

describe("grocery partner format helpers", () => {
  it("formats unit-aware prices and stock labels", () => {
    expect(formatMoney(8450)).toContain("8");
    expect(formatChange(12.5)).toBe("+12.5% vs yesterday");
    expect(unitLabel("millilitre")).toBe("ml");
    expect(groceryStatusLabel("handed_to_driver")).toBe("Handed to Driver");
    expect(inventoryLabel("low_stock")).toBe("Low Stock");
    expect(inventoryLabel("out_of_stock")).toBe("Out of Stock");
  });
});
