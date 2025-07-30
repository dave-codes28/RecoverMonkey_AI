"use client";

import React, { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { 
  Store, 
  Mail, 
  Bot, 
  Settings, 
  Save, 
  RefreshCw, 
  AlertTriangle, 
  CheckCircle,
  Globe,
  Bell,
  Shield,
  Palette,
  Database,
  Zap,
  Clock,
  DollarSign
} from "lucide-react";

export function SettingsPage() {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [initialized, setInitialized] = useState(false);

  // Shop Settings
  const [shopSettings, setShopSettings] = useState({
    shopName: "My Shopify Store",
    shopDomain: "my-store.myshopify.com",
    currency: "USD",
    timezone: "America/New_York",
    language: "en"
  });

  // Email Settings
  const [emailSettings, setEmailSettings] = useState({
    senderName: "RecoverMonkey",
    senderEmail: "noreply@recovermonkey.com",
    replyToEmail: "support@recovermonkey.com",
    emailFrequency: "immediate",
    maxEmailsPerDay: 100,
    emailTemplate: "default"
  });

  // AI Assistant Settings
  const [aiSettings, setAiSettings] = useState({
    enabled: true,
    model: "gpt-4",
    maxTokens: 1000,
    temperature: 0.7,
    autoRespond: true,
    responseDelay: 5
  });

  // General Settings
  const [generalSettings, setGeneralSettings] = useState({
    notifications: true,
    emailNotifications: true,
    pushNotifications: false,
    darkMode: "system",
    autoSync: true,
    syncInterval: 30
  });

  // Recovery Settings
  const [recoverySettings, setRecoverySettings] = useState({
    abandonedCartThreshold: 60, // minutes
    maxRecoveryAttempts: 3,
    recoveryDelay: 24, // hours
    discountEnabled: true,
    discountPercentage: 10,
    discountCode: "RECOVER10"
  });

  const handleSave = async (section: string) => {
    setSaving(true);
    try {
      let settings;
      switch (section) {
        case "Shop":
          settings = shopSettings;
          break;
        case "Email":
          settings = emailSettings;
          break;
        case "AI Assistant":
          settings = aiSettings;
          break;
        case "Recovery":
          settings = recoverySettings;
          break;
        case "General":
          settings = generalSettings;
          break;
        default:
          throw new Error("Invalid section");
      }

      const response = await fetch('/api/settings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          section: section.toLowerCase().replace(' ', '-'),
          settings
        }),
      });

      const result = await response.json();

      if (result.success) {
        toast({
          title: "Settings Saved",
          description: `${section} settings have been updated successfully.`,
        });
      } else {
        throw new Error(result.error || 'Failed to save settings');
      }
    } catch (error) {
      console.error('Error saving settings:', error);
      toast({
        title: "Error",
        description: "Failed to save settings. Please try again.",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const handleTestConnection = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/settings/test-connection', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          shopDomain: shopSettings.shopDomain
        }),
      });

      const result = await response.json();

      if (result.success) {
        toast({
          title: "Connection Successful",
          description: result.message || "Successfully connected to Shopify store.",
        });
      } else {
        throw new Error(result.error || 'Connection failed');
      }
    } catch (error) {
      console.error('Error testing connection:', error);
      toast({
        title: "Connection Failed",
        description: error instanceof Error ? error.message : "Failed to connect to Shopify store. Please check your credentials.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // Load settings on component mount
  useEffect(() => {
    const loadSettings = async () => {
      try {
        const response = await fetch('/api/settings');
        const result = await response.json();
        
        if (result.success && result.data) {
          if (result.data.shop) setShopSettings(result.data.shop);
          if (result.data.email) setEmailSettings(result.data.email);
          if (result.data.ai) setAiSettings(result.data.ai);
          if (result.data.general) setGeneralSettings(result.data.general);
          if (result.data.recovery) setRecoverySettings(result.data.recovery);
        }
      } catch (error) {
        console.error('Error loading settings:', error);
        toast({
          title: "Error",
          description: "Failed to load settings. Using default values.",
          variant: "destructive",
        });
      } finally {
        setInitialized(true);
      }
    };

    loadSettings();
  }, [toast]);

  if (!initialized) {
    return (
      <div className="flex flex-col gap-8">
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
            <p className="text-muted-foreground">
              Manage your RecoverMonkey configuration and preferences.
            </p>
          </div>
        </div>
        <div className="flex items-center justify-center py-12">
          <div className="flex items-center gap-2">
            <RefreshCw className="h-5 w-5 animate-spin" />
            <span>Loading settings...</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
          <p className="text-muted-foreground">
            Manage your RecoverMonkey configuration and preferences.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
            <CheckCircle className="h-3 w-3 mr-1" />
            Connected
          </Badge>
        </div>
      </div>

      <Tabs defaultValue="shop" className="space-y-6">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="shop" className="flex items-center gap-2">
            <Store className="h-4 w-4" />
            Shop
          </TabsTrigger>
          <TabsTrigger value="email" className="flex items-center gap-2">
            <Mail className="h-4 w-4" />
            Email
          </TabsTrigger>
          <TabsTrigger value="ai" className="flex items-center gap-2">
            <Bot className="h-4 w-4" />
            AI Assistant
          </TabsTrigger>
          <TabsTrigger value="recovery" className="flex items-center gap-2">
            <Zap className="h-4 w-4" />
            Recovery
          </TabsTrigger>
          <TabsTrigger value="general" className="flex items-center gap-2">
            <Settings className="h-4 w-4" />
            General
          </TabsTrigger>
        </TabsList>

        {/* Shop Settings */}
        <TabsContent value="shop" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Store className="h-5 w-5" />
                Shop Configuration
              </CardTitle>
              <CardDescription>
                Configure your Shopify store settings and connection details.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="shopName">Shop Name</Label>
                  <Input
                    id="shopName"
                    value={shopSettings.shopName}
                    onChange={(e) => setShopSettings({...shopSettings, shopName: e.target.value})}
                    placeholder="Enter your shop name"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="shopDomain">Shop Domain</Label>
                  <Input
                    id="shopDomain"
                    value={shopSettings.shopDomain}
                    onChange={(e) => setShopSettings({...shopSettings, shopDomain: e.target.value})}
                    placeholder="your-store.myshopify.com"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="currency">Currency</Label>
                  <Select value={shopSettings.currency} onValueChange={(value) => setShopSettings({...shopSettings, currency: value})}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="USD">USD ($)</SelectItem>
                      <SelectItem value="EUR">EUR (€)</SelectItem>
                      <SelectItem value="GBP">GBP (£)</SelectItem>
                      <SelectItem value="CAD">CAD (C$)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="timezone">Timezone</Label>
                  <Select value={shopSettings.timezone} onValueChange={(value) => setShopSettings({...shopSettings, timezone: value})}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="America/New_York">Eastern Time</SelectItem>
                      <SelectItem value="America/Chicago">Central Time</SelectItem>
                      <SelectItem value="America/Denver">Mountain Time</SelectItem>
                      <SelectItem value="America/Los_Angeles">Pacific Time</SelectItem>
                      <SelectItem value="Europe/London">London</SelectItem>
                      <SelectItem value="Europe/Paris">Paris</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <Separator />
              
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-medium">Shop Connection</h4>
                  <p className="text-sm text-muted-foreground">
                    Test your connection to Shopify
                  </p>
                </div>
                <Button onClick={handleTestConnection} disabled={loading}>
                  {loading ? (
                    <>
                      <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                      Testing...
                    </>
                  ) : (
                    "Test Connection"
                  )}
                </Button>
              </div>
              
              <div className="flex justify-end">
                <Button onClick={() => handleSave("Shop")} disabled={saving}>
                  {saving ? (
                    <>
                      <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="h-4 w-4 mr-2" />
                      Save Shop Settings
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Email Settings */}
        <TabsContent value="email" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Mail className="h-5 w-5" />
                Email Configuration
              </CardTitle>
              <CardDescription>
                Configure email settings for cart recovery campaigns.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="senderName">Sender Name</Label>
                  <Input
                    id="senderName"
                    value={emailSettings.senderName}
                    onChange={(e) => setEmailSettings({...emailSettings, senderName: e.target.value})}
                    placeholder="RecoverMonkey"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="senderEmail">Sender Email</Label>
                  <Input
                    id="senderEmail"
                    type="email"
                    value={emailSettings.senderEmail}
                    onChange={(e) => setEmailSettings({...emailSettings, senderEmail: e.target.value})}
                    placeholder="noreply@yourdomain.com"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="replyToEmail">Reply-To Email</Label>
                  <Input
                    id="replyToEmail"
                    type="email"
                    value={emailSettings.replyToEmail}
                    onChange={(e) => setEmailSettings({...emailSettings, replyToEmail: e.target.value})}
                    placeholder="support@yourdomain.com"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="emailFrequency">Email Frequency</Label>
                  <Select value={emailSettings.emailFrequency} onValueChange={(value) => setEmailSettings({...emailSettings, emailFrequency: value})}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="immediate">Immediate</SelectItem>
                      <SelectItem value="hourly">Hourly</SelectItem>
                      <SelectItem value="daily">Daily</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="maxEmailsPerDay">Max Emails Per Day</Label>
                  <Input
                    id="maxEmailsPerDay"
                    type="number"
                    value={emailSettings.maxEmailsPerDay}
                    onChange={(e) => setEmailSettings({...emailSettings, maxEmailsPerDay: parseInt(e.target.value)})}
                    placeholder="100"
                  />
                </div>
              </div>
              
              <div className="flex justify-end">
                <Button onClick={() => handleSave("Email")} disabled={saving}>
                  {saving ? (
                    <>
                      <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="h-4 w-4 mr-2" />
                      Save Email Settings
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* AI Assistant Settings */}
        <TabsContent value="ai" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bot className="h-5 w-5" />
                AI Assistant Configuration
              </CardTitle>
              <CardDescription>
                Configure AI assistant behavior and responses.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Enable AI Assistant</Label>
                  <p className="text-sm text-muted-foreground">
                    Allow AI to automatically respond to customer inquiries
                  </p>
                </div>
                <Switch
                  checked={aiSettings.enabled}
                  onCheckedChange={(checked) => setAiSettings({...aiSettings, enabled: checked})}
                />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="aiModel">AI Model</Label>
                  <Select value={aiSettings.model} onValueChange={(value) => setAiSettings({...aiSettings, model: value})}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="gpt-4">GPT-4 (Recommended)</SelectItem>
                      <SelectItem value="gpt-3.5-turbo">GPT-3.5 Turbo</SelectItem>
                      <SelectItem value="claude-3">Claude 3</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="maxTokens">Max Tokens</Label>
                  <Input
                    id="maxTokens"
                    type="number"
                    value={aiSettings.maxTokens}
                    onChange={(e) => setAiSettings({...aiSettings, maxTokens: parseInt(e.target.value)})}
                    placeholder="1000"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="temperature">Temperature</Label>
                  <Input
                    id="temperature"
                    type="number"
                    step="0.1"
                    min="0"
                    max="2"
                    value={aiSettings.temperature}
                    onChange={(e) => setAiSettings({...aiSettings, temperature: parseFloat(e.target.value)})}
                    placeholder="0.7"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="responseDelay">Response Delay (minutes)</Label>
                  <Input
                    id="responseDelay"
                    type="number"
                    value={aiSettings.responseDelay}
                    onChange={(e) => setAiSettings({...aiSettings, responseDelay: parseInt(e.target.value)})}
                    placeholder="5"
                  />
                </div>
              </div>
              
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Auto-Respond</Label>
                  <p className="text-sm text-muted-foreground">
                    Automatically send AI-generated responses
                  </p>
                </div>
                <Switch
                  checked={aiSettings.autoRespond}
                  onCheckedChange={(checked) => setAiSettings({...aiSettings, autoRespond: checked})}
                />
              </div>
              
              <div className="flex justify-end">
                <Button onClick={() => handleSave("AI Assistant")} disabled={saving}>
                  {saving ? (
                    <>
                      <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="h-4 w-4 mr-2" />
                      Save AI Settings
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Recovery Settings */}
        <TabsContent value="recovery" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Zap className="h-5 w-5" />
                Recovery Configuration
              </CardTitle>
              <CardDescription>
                Configure cart recovery behavior and incentives.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="abandonedCartThreshold">Abandoned Cart Threshold (minutes)</Label>
                  <Input
                    id="abandonedCartThreshold"
                    type="number"
                    value={recoverySettings.abandonedCartThreshold}
                    onChange={(e) => setRecoverySettings({...recoverySettings, abandonedCartThreshold: parseInt(e.target.value)})}
                    placeholder="60"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="maxRecoveryAttempts">Max Recovery Attempts</Label>
                  <Input
                    id="maxRecoveryAttempts"
                    type="number"
                    value={recoverySettings.maxRecoveryAttempts}
                    onChange={(e) => setRecoverySettings({...recoverySettings, maxRecoveryAttempts: parseInt(e.target.value)})}
                    placeholder="3"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="recoveryDelay">Recovery Delay (hours)</Label>
                  <Input
                    id="recoveryDelay"
                    type="number"
                    value={recoverySettings.recoveryDelay}
                    onChange={(e) => setRecoverySettings({...recoverySettings, recoveryDelay: parseInt(e.target.value)})}
                    placeholder="24"
                  />
                </div>
              </div>
              
              <Separator />
              
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Enable Discount Codes</Label>
                    <p className="text-sm text-muted-foreground">
                      Automatically apply discount codes to abandoned carts
                    </p>
                  </div>
                  <Switch
                    checked={recoverySettings.discountEnabled}
                    onCheckedChange={(checked) => setRecoverySettings({...recoverySettings, discountEnabled: checked})}
                  />
                </div>
                
                {recoverySettings.discountEnabled && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="discountPercentage">Discount Percentage</Label>
                      <Input
                        id="discountPercentage"
                        type="number"
                        value={recoverySettings.discountPercentage}
                        onChange={(e) => setRecoverySettings({...recoverySettings, discountPercentage: parseInt(e.target.value)})}
                        placeholder="10"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="discountCode">Discount Code</Label>
                      <Input
                        id="discountCode"
                        value={recoverySettings.discountCode}
                        onChange={(e) => setRecoverySettings({...recoverySettings, discountCode: e.target.value})}
                        placeholder="RECOVER10"
                      />
                    </div>
                  </div>
                )}
              </div>
              
              <div className="flex justify-end">
                <Button onClick={() => handleSave("Recovery")} disabled={saving}>
                  {saving ? (
                    <>
                      <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="h-4 w-4 mr-2" />
                      Save Recovery Settings
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* General Settings */}
        <TabsContent value="general" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5" />
                General Preferences
              </CardTitle>
              <CardDescription>
                Configure general application settings and notifications.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Enable Notifications</Label>
                    <p className="text-sm text-muted-foreground">
                      Receive notifications for important events
                    </p>
                  </div>
                  <Switch
                    checked={generalSettings.notifications}
                    onCheckedChange={(checked) => setGeneralSettings({...generalSettings, notifications: checked})}
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Email Notifications</Label>
                    <p className="text-sm text-muted-foreground">
                      Receive email notifications
                    </p>
                  </div>
                  <Switch
                    checked={generalSettings.emailNotifications}
                    onCheckedChange={(checked) => setGeneralSettings({...generalSettings, emailNotifications: checked})}
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Push Notifications</Label>
                    <p className="text-sm text-muted-foreground">
                      Receive browser push notifications
                    </p>
                  </div>
                  <Switch
                    checked={generalSettings.pushNotifications}
                    onCheckedChange={(checked) => setGeneralSettings({...generalSettings, pushNotifications: checked})}
                  />
                </div>
              </div>
              
              <Separator />
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="darkMode">Theme</Label>
                  <Select value={generalSettings.darkMode} onValueChange={(value) => setGeneralSettings({...generalSettings, darkMode: value})}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="light">Light</SelectItem>
                      <SelectItem value="dark">Dark</SelectItem>
                      <SelectItem value="system">System</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="syncInterval">Auto Sync Interval (minutes)</Label>
                  <Input
                    id="syncInterval"
                    type="number"
                    value={generalSettings.syncInterval}
                    onChange={(e) => setGeneralSettings({...generalSettings, syncInterval: parseInt(e.target.value)})}
                    placeholder="30"
                  />
                </div>
              </div>
              
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Auto Sync</Label>
                  <p className="text-sm text-muted-foreground">
                    Automatically sync data with Shopify
                  </p>
                </div>
                <Switch
                  checked={generalSettings.autoSync}
                  onCheckedChange={(checked) => setGeneralSettings({...generalSettings, autoSync: checked})}
                />
              </div>
              
              <div className="flex justify-end">
                <Button onClick={() => handleSave("General")} disabled={saving}>
                  {saving ? (
                    <>
                      <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="h-4 w-4 mr-2" />
                      Save General Settings
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
