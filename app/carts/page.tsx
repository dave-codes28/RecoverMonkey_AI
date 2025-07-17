import { DashboardLayout } from "@/components/ui/dashboard-layout"
import { AbandonedCartsPage } from "@/components/ui/abandoned-carts-page"

export default function CartsPage() {
  return (
    <DashboardLayout>
      <AbandonedCartsPage />
    </DashboardLayout>
  );
}
