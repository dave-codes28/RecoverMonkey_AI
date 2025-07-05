"use client"

import * as React from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Save, Send, Eye } from "lucide-react"

export function EmailTemplateEditor() {
  const [subject, setSubject] = React.useState("Don't forget your items!")
  const [emailBody, setEmailBody] = React.useState(`Hi {{customer_name}},

We noticed you left some great items in your cart. Don't let them get away!

**Your Cart:**
{{cart_items}}

**Total: {{cart_total}}**

Complete your purchase now and get free shipping on orders over $50.

[Complete Your Purchase]({{checkout_url}})

Thanks,
The RecoverMonkey Team`)

  // --- Added for backend integration and UI feedback ---
  const [saving, setSaving] = React.useState(false);
  const [success, setSuccess] = React.useState<string | null>(null);
  const [error, setError] = React.useState<string | null>(null);
  const SHOP_ID = "YOUR_SHOP_ID"; // TODO: Replace with real shop_id from context/auth

  const handleSave = async () => {
    setSaving(true);
    setSuccess(null);
    setError(null);
    try {
      const res = await fetch("/api/email/templates", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          shop_id: SHOP_ID,
          name: "Default", // Or allow user to set name
          subject,
          html: emailBody,
          is_default: true,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to save template");
      setSuccess("Template saved successfully!");
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };
  // --- End added ---

  const previewData = {
    customer_name: "Sarah Johnson",
    cart_items: "• Wireless Headphones - $79.99\n• Phone Case - $19.99\n• Screen Protector - $9.99",
    cart_total: "$109.97",
    checkout_url: "#",
  }

  const renderPreview = (text: string) => {
    let preview = text
    Object.entries(previewData).forEach(([key, value]) => {
      preview = preview.replace(new RegExp(`{{${key}}}`, "g"), value)
    })
    return preview
  }

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Email Templates</h2>
        <p className="text-muted-foreground">Customize your cart recovery email templates</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Editor */}
        <Card className="card-shadow-lg">
          <CardHeader>
            <CardTitle>Template Editor</CardTitle>
            <CardDescription>Edit your email template with dynamic variables</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="subject">Subject Line</Label>
              <Input
                id="subject"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                placeholder="Enter email subject..."
                className="shadow-sm"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="body">Email Body</Label>
              <Textarea
                id="body"
                value={emailBody}
                onChange={(e) => setEmailBody(e.target.value)}
                placeholder="Enter email content..."
                className="min-h-[300px] font-mono text-sm shadow-sm"
              />
            </div>

            <div className="space-y-2">
              <Label>Available Variables</Label>
              <div className="flex flex-wrap gap-2">
                {Object.keys(previewData).map((variable) => (
                  <Badge key={variable} variant="outline" className="text-xs shadow-sm">
                    {`{{${variable}}}`}
                  </Badge>
                ))}
              </div>
            </div>

            <div className="flex space-x-2">
              <Button className="shadow-sm" onClick={handleSave} disabled={saving}>
                <Save className="mr-2 h-4 w-4" />
                {saving ? "Saving..." : "Save Template"}
              </Button>
              <Button variant="outline" className="shadow-sm">
                <Send className="mr-2 h-4 w-4" />
                Test Send
              </Button>
            </div>
            {/* UI Feedback */}
            {success && <div className="text-green-600 pt-2">{success}</div>}
            {error && <div className="text-red-600 pt-2">{error}</div>}
          </CardContent>
        </Card>

        {/* Preview */}
        <Card className="card-shadow-lg">
          <CardHeader>
            <CardTitle>Live Preview</CardTitle>
            <CardDescription>See how your email will look to customers</CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="preview" className="w-full">
              <TabsList className="grid w-full grid-cols-2 shadow-sm">
                <TabsTrigger value="preview">
                  <Eye className="mr-2 h-4 w-4" />
                  Preview
                </TabsTrigger>
                <TabsTrigger value="html">HTML</TabsTrigger>
              </TabsList>
              <TabsContent value="preview" className="space-y-4">
                <div className="rounded-lg border bg-card text-card-foreground p-6 shadow-md">
                  <div className="mb-4 border-b border-border pb-2">
                    <h3 className="font-semibold">Subject: {subject}</h3>
                  </div>
                  <div className="space-y-4">
                    {renderPreview(emailBody)
                      .split("\n")
                      .map((line, index) => {
                        if (line.startsWith("**") && line.endsWith("**")) {
                          return (
                            <p key={index} className="font-bold">
                              {line.slice(2, -2)}
                            </p>
                          )
                        }
                        if (line.startsWith("# ")) {
                          return (
                            <h1 key={index} className="text-2xl font-bold">
                              {line.slice(2)}
                            </h1>
                          )
                        }
                        if (line.startsWith("[") && line.includes("](")) {
                          const match = line.match(/\[([^\]]+)\]\(([^)]+)\)/)
                          if (match) {
                            return (
                              <p key={index}>
                                <a href={match[2]} className="text-primary underline hover:text-primary/80">
                                  {match[1]}
                                </a>
                              </p>
                            )
                          }
                        }
                        return line ? (
                          <p key={index} className="whitespace-pre-line">
                            {line}
                          </p>
                        ) : (
                          <br key={index} />
                        )
                      })}
                  </div>
                </div>
              </TabsContent>
              <TabsContent value="html">
                <div className="rounded-lg border bg-muted p-4 shadow-sm">
                  <pre className="text-sm">
                    <code>{`<html>
<body>
  <h2>${subject}</h2>
  <div>
    ${renderPreview(emailBody).replace(/\n/g, "<br>")}
  </div>
</body>
</html>`}</code>
                  </pre>
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
