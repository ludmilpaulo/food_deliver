import {
  allowsFractional,
  formatChange,
  formatMoney,
  groceryStatusLabel,
  inventoryLabel,
  partnerStatus,
  unitLabel,
} from "@/features/grocery-partner/format";
import {
  groceryCategoryLabel,
  groceryDiscountTypeTranslationKey,
  grocerySubcategoryLabel,
  sellingUnitTranslationKey,
} from "@/utils/groceryUnits";

describe("grocery partner format helpers", () => {
  it("formats unit-aware prices and stock labels", () => {
    expect(formatMoney(8450)).toContain("8");
    expect(formatChange(12.5)).toBe("+12.5% vs yesterday");
    expect(unitLabel("millilitre")).toBe("ml");
    expect(groceryStatusLabel("handed_to_driver")).toBe("Handed to Driver");
    expect(inventoryLabel("low_stock")).toBe("Low Stock");
    expect(inventoryLabel("out_of_stock")).toBe("Out of Stock");
  });

  it("allows fractional stock only for weight and volume units the API uses", () => {
    expect(allowsFractional("kg")).toBe(true);
    expect(allowsFractional("gram")).toBe(true);
    expect(allowsFractional("millilitre")).toBe(true);
    expect(allowsFractional("item")).toBe(false);
    expect(allowsFractional(undefined)).toBe(false);
  });

  it("derives the partner status from activity, approval and inventory", () => {
    const base = { is_active: true, approval_status: "approved", inventory_status: "low_stock" };
    expect(partnerStatus(base)).toBe("low_stock");
    expect(partnerStatus({ ...base, is_active: false })).toBe("inactive");
    expect(partnerStatus({ ...base, approval_status: "draft" })).toBe("draft");
    expect(partnerStatus({ ...base, approval_status: "pending" })).toBe("pending_approval");
  });

  it("translates the API's unit and promotion codes", () => {
    expect(sellingUnitTranslationKey("gram", "gp")).toBe("gpUnitG");
    expect(sellingUnitTranslationKey("litre", "gp")).toBe("gpUnitL");
    expect(sellingUnitTranslationKey("millilitre", "gp")).toBe("gpUnitMl");
    expect(groceryDiscountTypeTranslationKey("percentage")).toBe("gpDiscountPercent");
    expect(groceryDiscountTypeTranslationKey("multibuy")).toBe("gpDiscountMulti");
  });

  it("falls back to the API name for categories without a translation", () => {
    const t = (key: string) => `t:${key}`;
    expect(groceryCategoryLabel(t, "pantry", "Pantry")).toBe("t:gpCatPantry");
    expect(groceryCategoryLabel(t, "snacks", "Snacks")).toBe("Snacks");
    expect(grocerySubcategoryLabel(t, "Cheese")).toBe("t:gpSubCheese");
    expect(grocerySubcategoryLabel(t, "Frozen Peas")).toBe("Frozen Peas");
  });
});
