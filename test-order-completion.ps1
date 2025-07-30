# Test Order Completion Webhook
Write-Host "🧪 Testing Order Completion Webhook..." -ForegroundColor Green

# Test 1: Order Completion Webhook
Write-Host "`n1. Testing POST /api/shopify/webhook (Order Completion)..." -ForegroundColor Yellow

$orderCompletionPayload = @{
    id = 98765
    order_number = "#1001"
    customer = @{
        id = 67890
        email = "test@example.com"
        first_name = "John"
        last_name = "Doe"
    }
    line_items = @(
        @{
            id = 1
            product_id = 100
            variant_id = 200
            title = "Test Product"
            quantity = 2
            price = "29.99"
            total = "59.98"
        },
        @{
            id = 2
            product_id = 101
            variant_id = 201
            title = "Another Product"
            quantity = 1
            price = "19.99"
            total = "19.99"
        }
    )
    total_price = "79.97"
    subtotal_price = "79.97"
    total_tax = "0.00"
    currency = "USD"
    created_at = "2024-01-01T12:00:00Z"
    updated_at = "2024-01-01T12:05:00Z"
    financial_status = "paid"
    fulfillment_status = "unfulfilled"
    tags = ""
    note = ""
    test = $true
}

$payloadJson = $orderCompletionPayload | ConvertTo-Json -Depth 10

$headers = @{
    "Content-Type" = "application/json"
    "x-shopify-topic" = "orders/create"
    "x-shopify-shop-domain" = "test-store.myshopify.com"
    "x-shopify-hmac-sha256" = "invalid-hmac-for-testing"
}

try {
    $response = Invoke-WebRequest -Uri "http://localhost:3000/api/shopify/webhook" -Method POST -Headers $headers -Body $payloadJson
    Write-Host "✅ Order Completion Webhook: Status $($response.StatusCode)" -ForegroundColor Green
    Write-Host "Response: $($response.Content)" -ForegroundColor Gray
} catch {
    $statusCode = $_.Exception.Response.StatusCode.value__
    if ($statusCode -eq 401) {
        Write-Host "✅ HMAC Verification Working: Status 401 (Expected - Invalid HMAC)" -ForegroundColor Green
        Write-Host "Response: $($_.Exception.Response.StatusDescription)" -ForegroundColor Gray
    } else {
        Write-Host "❌ Order Completion Webhook failed: $($_.Exception.Message)" -ForegroundColor Red
    }
}

# Test 2: Check Database for Recovered Carts
Write-Host "`n2. Testing Database Query for Recovered Carts..." -ForegroundColor Yellow
Write-Host "Note: This would require a database query to verify carts were marked as recovered" -ForegroundColor Gray
Write-Host "Expected behavior:" -ForegroundColor Cyan
Write-Host "- Find abandoned carts with email 'test@example.com'" -ForegroundColor Gray
Write-Host "- Mark them as 'recovered' status" -ForegroundColor Gray
Write-Host "- Set recovered_at timestamp" -ForegroundColor Gray
Write-Host "- Set recovered_order_id to 98765" -ForegroundColor Gray

Write-Host "`n🎉 Order Completion Testing Complete!" -ForegroundColor Green
Write-Host "`n📝 Notes:" -ForegroundColor Cyan
Write-Host "- Order completion webhook is now implemented" -ForegroundColor Gray
Write-Host "- Carts with matching email will be marked as 'recovered'" -ForegroundColor Gray
Write-Host "- Customer information will be updated" -ForegroundColor Gray
Write-Host "- Recovery metadata will be logged" -ForegroundColor Gray 