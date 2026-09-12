import {
  barChartTooltipOptions,
  fallbackReportLabels,
  pieChartSeries,
  pieChartTooltipOptions,
  reportAxisLabels,
} from "@/utils/reportCharts";

describe("report chart helpers", () => {
  it("uses a number array for pie series so ApexCharts can show hover values", () => {
    expect(pieChartSeries([10, 20, 5])).toEqual([10, 20, 5]);
    expect(pieChartSeries(undefined)).toEqual([]);
    expect(pieChartSeries(null)).toEqual([]);
  });

  it("falls back to hour, weekday, or month-day labels", () => {
    expect(fallbackReportLabels("day", 24)).toHaveLength(24);
    expect(fallbackReportLabels("day", 24)[0]).toBe("00h");
    expect(fallbackReportLabels("week", 7)).toEqual(["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]);
    expect(fallbackReportLabels("month", 28)).toHaveLength(28);
    expect(fallbackReportLabels("month", 28)[27]).toBe("28");
  });

  it("prefers API labels when present", () => {
    expect(reportAxisLabels(["1", "2"], "month", 2)).toEqual(["1", "2"]);
    expect(reportAxisLabels(undefined, "week", 7)[0]).toBe("Mon");
  });

  it("enables tooltips on bar and pie options", () => {
    expect(barChartTooltipOptions(["Mon"], "revenue-chart").tooltip.enabled).toBe(true);
    expect(pieChartTooltipOptions(["Pizza"]).tooltip.enabled).toBe(true);
  });
});
