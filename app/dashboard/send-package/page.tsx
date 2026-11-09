import ProviderDashboardShell from "@/components/dashboards/ProviderDashboardShell";
import { PROVIDER_DASHBOARDS } from "@/configs/providerDashboards";

export default function SendPackageProviderDashboardPage() {
  return <ProviderDashboardShell config={PROVIDER_DASHBOARDS["send-package"]} />;
}
