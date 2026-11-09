import ProviderDashboardShell from "@/components/dashboards/ProviderDashboardShell";
import { PROVIDER_DASHBOARDS } from "@/configs/providerDashboards";

export default function FoodProviderDashboardPage() {
  return <ProviderDashboardShell config={PROVIDER_DASHBOARDS.food} />;
}
