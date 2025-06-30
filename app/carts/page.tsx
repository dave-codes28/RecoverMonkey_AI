import { DashboardLayout } from "@/components/dashboard-layout"
import { AbandonedCartsPage } from "@/components/abandoned-carts-page"

export default function CartsPage() {
  return (
    <DashboardLayout>
      <AbandonedCartsPage />
    </DashboardLayout>
  )
}
