export type ReportTimeframe = "day" | "week" | "month";

export const REPORT_TIMEFRAMES: ReportTimeframe[] = ["day", "week", "month"];

export function pieChartSeries(data: number[] | undefined | null): number[] {
  return Array.isArray(data) ? data : [];
}

export function fallbackReportLabels(timeframe: ReportTimeframe, length: number): string[] {
  if (timeframe === "day") {
    return Array.from({ length: Math.max(length, 24) }, (_, index) => `${String(index).padStart(2, "0")}h`).slice(
      0,
      Math.max(length, 24),
    );
  }
  if (timeframe === "month") {
    const size = length > 0 ? length : 31;
    return Array.from({ length: size }, (_, index) => String(index + 1));
  }
  return ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
}

export function reportAxisLabels(
  labels: string[] | undefined,
  timeframe: ReportTimeframe,
  seriesLength: number,
): string[] {
  if (labels && labels.length > 0) {
    return labels;
  }
  return fallbackReportLabels(timeframe, seriesLength);
}

export function barChartTooltipOptions(categories: string[], chartId: string) {
  return {
    chart: { id: chartId, toolbar: { show: false } },
    xaxis: { categories },
    tooltip: {
      enabled: true,
      y: {
        formatter: (value: number) => `${value}`,
      },
    },
    dataLabels: { enabled: false },
  };
}

export function pieChartTooltipOptions(labels: string[]) {
  return {
    labels,
    tooltip: {
      enabled: true,
      y: {
        formatter: (value: number) => `${value}`,
      },
    },
  };
}
