import { selectUser } from "@/redux/slices/authSlice";
import { useEffect, useMemo, useState } from "react";
import { useSelector } from "react-redux";
import dynamic from "next/dynamic";
import { useTranslation } from "@/hooks/useTranslation";
import AnalyticsTimeframeFilter from "@/components/analytics/AnalyticsTimeframeFilter";
import AnalyticsComparisonStrip from "@/components/analytics/AnalyticsComparisonStrip";
import AnalyticsExportButtons from "@/components/analytics/AnalyticsExportButtons";
import { fetchPartnerReport, type PartnerReportData } from "@/features/partner/api/partnerReportsApi";
import { formatPercentChange, mapMetricComparison } from "@/utils/analyticsExport";
import {
  barChartTooltipOptions,
  pieChartSeries,
  pieChartTooltipOptions,
  reportAxisLabels,
  type ReportTimeframe,
} from "@/utils/reportCharts";

const Chart = dynamic(() => import("react-apexcharts"), { ssr: false });

const Report: React.FC = () => {
  const { t } = useTranslation();
  const [timeframe, setTimeframe] = useState<ReportTimeframe>("week");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<PartnerReportData>({
    revenue: [],
    orders: [],
    products: { labels: [], data: [] },
    drivers: { labels: [], data: [] },
    customers: { labels: [], data: [] },
  });

  const user = useSelector(selectUser);

  const chartLabels = useMemo(
    () => reportAxisLabels(data.labels, timeframe, data.revenue.length),
    [data.labels, data.revenue.length, timeframe],
  );

  const revenueComparison = mapMetricComparison(data.comparison?.revenue);
  const ordersComparison = mapMetricComparison(data.comparison?.orders);
  const hasComparison = Boolean(data.comparison);

  const timeframeLabel = (value: ReportTimeframe) => {
    if (value === "day") return t("reportDay", "Day");
    if (value === "month") return t("reportMonth", "Month");
    return t("reportWeek", "Week");
  };

  const exportPayload = useMemo(
    () => ({
      title: t("storeReport", "Store Report"),
      subtitle: timeframeLabel(timeframe),
      sections: [
        ...(hasComparison
          ? [
              {
                title: t("comparisonTitle", "Period comparison"),
                rows: [
                  {
                    label: t("revenue", "Revenue"),
                    value: `${revenueComparison.current} (${formatPercentChange(revenueComparison.percentChange)})`,
                  },
                  {
                    label: t("numberOfOrders", "Orders"),
                    value: `${ordersComparison.current} (${formatPercentChange(ordersComparison.percentChange)})`,
                  },
                ],
              },
            ]
          : []),
        {
          title: t("revenue", "Revenue"),
          rows: chartLabels.map((label, index) => ({
            label,
            value: data.revenue[index] ?? 0,
          })),
        },
      ],
    }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [data, timeframe, t, revenueComparison, ordersComparison, chartLabels, hasComparison],
  );

  useEffect(() => {
    const loadReport = async () => {
      setLoading(true);
      setError(null);
      try {
        const responseData = await fetchPartnerReport({ timeframe });
        setData(responseData);
      } catch (err) {
        console.error("Error fetching data:", err);
        setError(t("failedToFetchData", "Failed to fetch data"));
      } finally {
        setLoading(false);
      }
    };

    void loadReport();
  }, [user, timeframe, t]);

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-3xl font-bold">{t("storeReport", "Store Report")}</h1>
        <div className="flex flex-col gap-2 sm:items-end">
          <AnalyticsTimeframeFilter
            value={timeframe}
            onChange={setTimeframe}
            labelFor={timeframeLabel}
          />
          <AnalyticsExportButtons
            payload={exportPayload}
            exportCsvLabel={t("exportCsv", "Export CSV")}
            exportPdfLabel={t("exportPdf", "Export PDF")}
          />
        </div>
      </div>

      {error ? <p className="mb-4 text-sm text-red-600">{error}</p> : null}
      {loading ? <p className="mb-4 text-sm text-slate-500">{t("loading", "Loading…")}</p> : null}

      {hasComparison ? (
        <div className="mb-6">
          <AnalyticsComparisonStrip
            title={t("comparisonTitle", "Period comparison")}
            vsPreviousLabel={t("vsPreviousPeriod", "Compared with previous period")}
            cards={[
              {
                key: "revenue",
                label: t("revenue", "Revenue"),
                comparison: revenueComparison,
                formatValue: (value) => value.toLocaleString(undefined, { maximumFractionDigits: 0 }),
              },
              {
                key: "orders",
                label: t("numberOfOrders", "Orders"),
                comparison: ordersComparison,
              },
            ]}
          />
        </div>
      ) : null}

      <div className="grid grid-cols-2 gap-4">
        <div className="border border-gray-300 rounded-lg overflow-hidden">
          <div className="bg-indigo-200 py-2 px-4">
            <h2 className="text-black font-bold text-lg">{t("revenue", "Revenue")}</h2>
          </div>
          <div className="p-4">
            <Chart
              options={barChartTooltipOptions(chartLabels, "revenue-chart")}
              series={[{ name: t("revenue", "Revenue"), data: data.revenue }]}
              type="bar"
            />
          </div>
        </div>

        <div className="border border-gray-300 rounded-lg overflow-hidden">
          <div className="bg-indigo-200 py-2 px-4">
            <h2 className="text-black font-bold text-lg">
              {t("numberOfOrders", "Number of orders")}
            </h2>
          </div>
          <div className="p-4">
            <Chart
              options={barChartTooltipOptions(chartLabels, "orders-chart")}
              series={[{ name: t("numberOfOrders", "Number of Orders"), data: data.orders }]}
              type="bar"
            />
          </div>
        </div>

        <div className="border border-gray-300 rounded-lg overflow-hidden">
          <div className="bg-indigo-200 py-2 px-4">
            <h2 className="text-black font-bold text-lg">
              {t("top3Products", "Top 3 products")}
            </h2>
          </div>
          <div className="p-4">
            {data.products?.labels?.length ? (
              <Chart
                options={pieChartTooltipOptions(data.products.labels)}
                series={pieChartSeries(data.products.data)}
                type="pie"
              />
            ) : (
              <p className="text-slate-500 text-sm">{t("noData", "No data")}</p>
            )}
          </div>
        </div>

        <div className="border border-gray-300 rounded-lg overflow-hidden">
          <div className="bg-indigo-200 py-2 px-4">
            <h2 className="text-black font-bold text-lg">
              {t("top3Drivers", "Top 3 drivers")}
            </h2>
          </div>
          <div className="p-4">
            {data.drivers?.labels?.length ? (
              <Chart
                options={pieChartTooltipOptions(data.drivers.labels)}
                series={pieChartSeries(data.drivers.data)}
                type="pie"
              />
            ) : (
              <p className="text-slate-500 text-sm">{t("noData", "No data")}</p>
            )}
          </div>
        </div>

        <div className="border border-gray-300 rounded-lg overflow-hidden">
          <div className="bg-indigo-200 py-2 px-4">
            <h2 className="text-black font-bold text-lg">
              {t("top3Customers", "Top 3 customers")}
            </h2>
          </div>
          <div className="p-4">
            {data.customers?.labels?.length ? (
              <Chart
                options={pieChartTooltipOptions(data.customers.labels)}
                series={pieChartSeries(data.customers.data)}
                type="pie"
              />
            ) : (
              <p className="text-slate-500 text-sm">{t("noData", "No data")}</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Report;
