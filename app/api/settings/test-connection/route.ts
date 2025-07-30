import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { shopDomain } = body;
    
    console.log('[API/settings/test-connection] Testing connection for shop:', shopDomain);
    
    // Validate the request
    if (!shopDomain) {
      return NextResponse.json(
        { success: false, error: 'Shop domain is required' },
        { status: 400 }
      );
    }
    
    // Simulate connection test
    // In a real app, you would make an API call to Shopify here
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Simulate success (in real app, check actual connection)
    const isConnected = Math.random() > 0.1; // 90% success rate for demo
    
    if (isConnected) {
      console.log('[API/settings/test-connection] Connection successful for:', shopDomain);
      return NextResponse.json({
        success: true,
        message: 'Successfully connected to Shopify store',
        data: {
          shopDomain,
          connected: true,
          shopName: 'Demo Store',
          plan: 'Basic',
          productsCount: 150,
          ordersCount: 1250
        }
      });
    } else {
      console.log('[API/settings/test-connection] Connection failed for:', shopDomain);
      return NextResponse.json(
        { 
          success: false, 
          error: 'Failed to connect to Shopify store. Please check your credentials and try again.',
          data: {
            shopDomain,
            connected: false
          }
        },
        { status: 400 }
      );
    }
  } catch (error) {
    console.error('[API/settings/test-connection] Error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to test connection' },
      { status: 500 }
    );
  }
} 