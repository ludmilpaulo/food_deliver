import ProviderDashboardShell from "@/components/dashboards/ProviderDashboardShell";
import { PROVIDER_DASHBOARDS } from "@/configs/providerDashboards";

export default function StayProviderDashboardPage() {
  return <ProviderDashboardShell config={PROVIDER_DASHBOARDS.stay} />;
}
