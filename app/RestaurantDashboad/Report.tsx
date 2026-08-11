import { selectUser } from "@/redux/slices/authSlice";
import { useEffect, useMemo, useState } from "react";
import { useSelector } from "react-redux";
import dynamic from "next/dynamic";
import { useTranslation } from "@/hooks/useTranslation";
import AnalyticsDaysFilter, { type AnalyticsDays } from "@/components/analytics/AnalyticsDaysFilter";
import AnalyticsComparisonStrip from "@/components/analytics/AnalyticsComparisonStrip";
import AnalyticsExportButtons from "@/components/analytics/AnalyticsExportButtons";
import { fetchPartnerReport, type PartnerReportData } from "@/features/partner/api/partnerReportsApi";
import { formatPercentChange, mapMetricComparison } from "@/utils/analyticsExport";

// Dynamically import ApexCharts to prevent SSR issues
const Chart = dynamic(() => import("react-apexcharts"), { ssr: false });

const Report: React.FC = () => {
  const { t } = useTranslation();
  const [days, setDays] = useState<AnalyticsDays>(7);
  const [data, setData] = useState<PartnerReportData>({
    revenue: [],
    orders: [],
    products: { labels: [], data: [] },
    drivers: { labels: [], data: [] },
    customers: { labels: [], data: [] },
  });

  const user = useSelector(selectUser);

  const chartLabels = useMemo(
    () => data.labels?.map((label) => label.slice(5)) ?? ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"],
    [data.labels],
  );

  const revenueComparison = mapMetricComparison(data.comparison?.revenue);
  const ordersComparison = mapMetricComparison(data.comparison?.orders);

  const daysLabel = (value: AnalyticsDays) => {
    if (value === 30) return t("days30", "Last 30 days");
    if (value === 90) return t("days90", "Last 90 days");
    return t("last7Days", "Last 7 days");
  };

  const exportPayload = useMemo(
    () => ({
      title: t("storeReport", "Store Report"),
      subtitle: daysLabel(days),
      sections: [
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
        {
          title: t("revenue", "Revenue"),
          rows: (data.labels ?? []).map((label, index) => ({
            label,
            value: data.revenue[index] ?? 0,
          })),
        },
      ],
    }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [data, days, t, revenueComparison, ordersComparison],
  );

  useEffect(() => {
    const loadReport = async () => {
      try {
        const responseData = await fetchPartnerReport({ days });
        setData(responseData);
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    void loadReport();
  }, [user, days]);

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-3xl font-bold">{t("storeReport", "Store Report")}</h1>
        <div className="flex flex-col gap-2 sm:items-end">
          <AnalyticsDaysFilter value={days} onChange={setDays} labelFor={daysLabel} />
          <AnalyticsExportButtons
            payload={exportPayload}
            exportCsvLabel={t("exportCsv", "Export CSV")}
            exportPdfLabel={t("exportPdf", "Export PDF")}
          />
        </div>
      </div>

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

      <div className="grid grid-cols-2 gap-4">
        <div className="border border-gray-300 rounded-lg overflow-hidden">
          <div className="bg-indigo-200 py-2 px-4">
            <h2 className="text-black font-bold text-lg">{t("revenue", "Revenue")}</h2>
          </div>
          <div className="p-4">
            <Chart
              options={{
                chart: { id: "revenue-chart" },
                xaxis: {
                  categories: chartLabels,
                },
              }}
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
              options={{
                chart: { id: "orders-chart" },
                xaxis: {
                  categories: chartLabels,
                },
              }}
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
            {data.products && (
              <Chart
                options={{ labels: data.products.labels }}
                series={[{ data: data.products.data }]}
                type="pie"
              />
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
            {data.drivers && (
              <Chart
                options={{ labels: data.drivers.labels }}
                series={[{ data: data.drivers.data }]}
                type="pie"
              />
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
            {data.customers && (
              <Chart
                options={{ labels: data.customers.labels }}
                series={[{ data: data.customers.data }]}
                type="pie"
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Report;