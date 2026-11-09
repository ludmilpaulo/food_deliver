import ProviderDashboardShell from "@/components/dashboards/ProviderDashboardShell";
import { PROVIDER_DASHBOARDS } from "@/configs/providerDashboards";

export default function WalletProviderDashboardPage() {
  return <ProviderDashboardShell config={PROVIDER_DASHBOARDS.wallet} />;
}
