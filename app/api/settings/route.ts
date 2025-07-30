import { NextRequest, NextResponse } from "next/server";

// Mock settings data - in a real app, this would come from a database
const mockSettings = {
  shop: {
    shopName: "My Shopify Store",
    shopDomain: "my-store.myshopify.com",
    currency: "USD",
    timezone: "America/New_York",
    language: "en"
  },
  email: {
    senderName: "RecoverMonkey",
    senderEmail: "noreply@recovermonkey.com",
    replyToEmail: "support@recovermonkey.com",
    emailFrequency: "immediate",
    maxEmailsPerDay: 100,
    emailTemplate: "default"
  },
  ai: {
    enabled: true,
    model: "gpt-4",
    maxTokens: 1000,
    temperature: 0.7,
    autoRespond: true,
    responseDelay: 5
  },
  general: {
    notifications: true,
    emailNotifications: true,
    pushNotifications: false,
    darkMode: "system",
    autoSync: true,
    syncInterval: 30
  },
  recovery: {
    abandonedCartThreshold: 60,
    maxRecoveryAttempts: 3,
    recoveryDelay: 24,
    discountEnabled: true,
    discountPercentage: 10,
    discountCode: "RECOVER10"
  }
};

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const section = searchParams.get('section');
    
    console.log('[API/settings] GET request for section:', section);
    
    if (section && mockSettings[section as keyof typeof mockSettings]) {
      return NextResponse.json({
        success: true,
        data: mockSettings[section as keyof typeof mockSettings]
      });
    }
    
    return NextResponse.json({
      success: true,
      data: mockSettings
    });
  } catch (error) {
    console.error('[API/settings] GET error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch settings' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { section, settings } = body;
    
    console.log('[API/settings] POST request for section:', section, 'settings:', settings);
    
    // Validate the request
    if (!section || !settings) {
      return NextResponse.json(
        { success: false, error: 'Section and settings are required' },
        { status: 400 }
      );
    }
    
    // In a real app, you would save to database here
    // For now, we'll just log and return success
    
    console.log('[API/settings] Saving settings for section:', section);
    console.log('[API/settings] Settings data:', JSON.stringify(settings, null, 2));
    
    // Simulate some processing time
    await new Promise(resolve => setTimeout(resolve, 500));
    
    return NextResponse.json({
      success: true,
      message: `${section} settings saved successfully`,
      data: settings
    });
  } catch (error) {
    console.error('[API/settings] POST error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to save settings' },
      { status: 500 }
    );
  }
} 