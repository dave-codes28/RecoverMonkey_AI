import { DashboardLayout } from "@/components/ui/dashboard-layout"
import { EmailTemplateEditor } from "@/components/ui/email-template-editor"

export default function TemplatesPage() {
  return (
    <DashboardLayout>
      <EmailTemplateEditor />
    </DashboardLayout>
  );
}
