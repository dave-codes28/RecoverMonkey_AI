"use client"
import * as React from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"
import { Save, CheckCircle, AlertCircle, ExternalLink } from "lucide-react"

export function SettingsPage() {
  const [autoRecovery, setAutoRecovery] = React.useState(true)
  const [emailDelay, setEmailDelay] = React.useState("30")
  const [smsEnabled, setSmsEnabled] = React.useState(false)
  const [shopifyConnected, setShopifyConnected] = React.useState(true)

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Settings</h2>
        <p className="text-muted-foreground">Configure your cart recovery preferences and integrations</p>
      </div>

      <div className="grid gap-6">
        {/* Shopify Integration */}
        <Card className="card-shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              Shopify Integration
              {shopifyConnected ? (
                <Badge className="bg-green-100 text-green-800 shadow-sm">
                  <CheckCircle className="mr-1 h-3 w-3" />
                  Connected
                </Badge>
              ) : (
                <Badge variant="destructive" className="shadow-sm">
                  <AlertCircle className="mr-1 h-3 w-3" />
                  Disconnected
                </Badge>
              )}
            </CardTitle>
            <CardDescription>Connect your Shopify store to sync abandoned carts</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="shop-url">Shop URL</Label>
                <Input id="shop-url" value="mystore.myshopify.com" disabled={shopifyConnected} className="shadow-sm" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="api-key">API Key</Label>
                <Input
                  id="api-key"
                  type="password"
                  value="••••••••••••••••"
                  disabled={shopifyConnected}
                  className="shadow-sm"
                />
              </div>
            </div>
            <div className="flex gap-2">
              {shopifyConnected ? (
                <Button variant="outline" onClick={() => setShopifyConnected(false)} className="shadow-sm">
                  Disconnect Store
                </Button>
              ) : (
                <Button onClick={() => setShopifyConnected(true)} className="shadow-sm">
                  Connect Store
                </Button>
              )}
              <Button variant="outline" className="shadow-sm">
                <ExternalLink className="mr-2 h-4 w-4" />
                View in Shopify
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Recovery Settings */}
        <Card className="card-shadow">
          <CardHeader>
            <CardTitle>Recovery Settings</CardTitle>
            <CardDescription>Configure how and when recovery emails are sent</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center justify-between p-3 rounded-lg hover:bg-muted/50 transition-colors">
              <div className="space-y-0.5">
                <Label className="text-base">Auto Recovery</Label>
                <div className="text-sm text-muted-foreground">Automatically send recovery emails to customers</div>
              </div>
              <Switch checked={autoRecovery} onCheckedChange={setAutoRecovery} />
            </div>

            <Separator />

            <div className="space-y-2">
              <Label htmlFor="email-delay">Email Delay</Label>
              <Select value={emailDelay} onValueChange={setEmailDelay}>
                <SelectTrigger className="shadow-sm">
                  <SelectValue placeholder="Select delay time" />
                </SelectTrigger>
                <SelectContent className="shadow-lg">
                  <SelectItem value="15">15 minutes</SelectItem>
                  <SelectItem value="30">30 minutes</SelectItem>
                  <SelectItem value="60">1 hour</SelectItem>
                  <SelectItem value="120">2 hours</SelectItem>
                  <SelectItem value="240">4 hours</SelectItem>
                  <SelectItem value="1440">24 hours</SelectItem>
                </SelectContent>
              </Select>
              <div className="text-sm text-muted-foreground">
                How long to wait before sending the first recovery email
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="follow-up">Follow-up Sequence</Label>
              <Select defaultValue="standard">
                <SelectTrigger className="shadow-sm">
                  <SelectValue placeholder="Select sequence" />
                </SelectTrigger>
                <SelectContent className="shadow-lg">
                  <SelectItem value="none">No follow-up</SelectItem>
                  <SelectItem value="standard">Standard (3 emails)</SelectItem>
                  <SelectItem value="aggressive">Aggressive (5 emails)</SelectItem>
                  <SelectItem value="custom">Custom sequence</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Notification Settings */}
        <Card className="card-shadow">
          <CardHeader>
            <CardTitle>Notification Settings</CardTitle>
            <CardDescription>Configure how you want to be notified about cart activity</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center justify-between p-3 rounded-lg hover:bg-muted/50 transition-colors">
              <div className="space-y-0.5">
                <Label className="text-base">SMS Notifications</Label>
                <div className="text-sm text-muted-foreground">Send SMS alerts for high-value abandoned carts</div>
              </div>
              <Switch checked={smsEnabled} onCheckedChange={setSmsEnabled} />
            </div>

            <Separator />

            <div className="space-y-2">
              <Label htmlFor="phone">Phone Number</Label>
              <Input
                id="phone"
                type="tel"
                placeholder="+1 (555) 123-4567"
                disabled={!smsEnabled}
                className="shadow-sm"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="threshold">SMS Threshold</Label>
              <Select defaultValue="100" disabled={!smsEnabled}>
                <SelectTrigger className="shadow-sm">
                  <SelectValue placeholder="Select threshold" />
                </SelectTrigger>
                <SelectContent className="shadow-lg">
                  <SelectItem value="50">$50+</SelectItem>
                  <SelectItem value="100">$100+</SelectItem>
                  <SelectItem value="200">$200+</SelectItem>
                  <SelectItem value="500">$500+</SelectItem>
                </SelectContent>
              </Select>
              <div className="text-sm text-muted-foreground">Only send SMS for carts above this value</div>
            </div>
          </CardContent>
        </Card>

        {/* Advanced Settings */}
        <Card className="card-shadow">
          <CardHeader>
            <CardTitle>Advanced Settings</CardTitle>
            <CardDescription>Advanced configuration options</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="timezone">Timezone</Label>
              <Select defaultValue="america/new_york">
                <SelectTrigger className="shadow-sm">
                  <SelectValue placeholder="Select timezone" />
                </SelectTrigger>
                <SelectContent className="shadow-lg">
                  <SelectItem value="america/new_york">Eastern Time (ET)</SelectItem>
                  <SelectItem value="america/chicago">Central Time (CT)</SelectItem>
                  <SelectItem value="america/denver">Mountain Time (MT)</SelectItem>
                  <SelectItem value="america/los_angeles">Pacific Time (PT)</SelectItem>
                  <SelectItem value="utc">UTC</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="currency">Currency</Label>
              <Select defaultValue="usd">
                <SelectTrigger className="shadow-sm">
                  <SelectValue placeholder="Select currency" />
                </SelectTrigger>
                <SelectContent className="shadow-lg">
                  <SelectItem value="usd">USD ($)</SelectItem>
                  <SelectItem value="eur">EUR (€)</SelectItem>
                  <SelectItem value="gbp">GBP (£)</SelectItem>
                  <SelectItem value="cad">CAD (C$)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="data-retention">Data Retention</Label>
              <Select defaultValue="90">
                <SelectTrigger className="shadow-sm">
                  <SelectValue placeholder="Select retention period" />
                </SelectTrigger>
                <SelectContent className="shadow-lg">
                  <SelectItem value="30">30 days</SelectItem>
                  <SelectItem value="90">90 days</SelectItem>
                  <SelectItem value="180">6 months</SelectItem>
                  <SelectItem value="365">1 year</SelectItem>
                  <SelectItem value="forever">Forever</SelectItem>
                </SelectContent>
              </Select>
              <div className="text-sm text-muted-foreground">How long to keep abandoned cart data</div>
            </div>
          </CardContent>
        </Card>

        {/* Save Button */}
        <div className="flex justify-end">
          <Button size="lg" className="shadow-md hover:shadow-lg transition-shadow">
            <Save className="mr-2 h-4 w-4" />
            Save Settings
          </Button>
        </div>
      </div>
    </div>
  )
}
