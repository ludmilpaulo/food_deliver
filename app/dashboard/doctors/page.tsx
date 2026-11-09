import ProviderDashboardShell from "@/components/dashboards/ProviderDashboardShell";
import { PROVIDER_DASHBOARDS } from "@/configs/providerDashboards";

export default function DoctorsProviderDashboardPage() {
  return <ProviderDashboardShell config={PROVIDER_DASHBOARDS.doctors} />;
}
