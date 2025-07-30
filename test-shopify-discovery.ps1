# Test Shopify Store Discovery
Write-Host "🔍 Testing Shopify Store Discovery..." -ForegroundColor Green

# Test 1: Discover Store Structure
Write-Host "`n1. Testing GET /api/shopify/discover-store (Store Analysis)..." -ForegroundColor Yellow
try {
    $response = Invoke-WebRequest -Uri "http://localhost:3000/api/shopify/discover-store?shop_id=d5a79116-842f-4a4b-afd6-a4bb225119cf" -Method GET
    Write-Host "✅ Store Discovery: Status $($response.StatusCode)" -ForegroundColor Green
    Write-Host "Response: $($response.Content)" -ForegroundColor Gray
} catch {
    Write-Host "❌ Store Discovery failed: $($_.Exception.Message)" -ForegroundColor Red
}

# Test 2: Sync All Data
Write-Host "`n2. Testing POST /api/shopify/discover-store (Sync All Data)..." -ForegroundColor Yellow
$syncPayload = @{
    shop_id = "d5a79116-842f-4a4b-afd6-a4bb225119cf"
    sync_type = "all"
}

try {
    $response = Invoke-WebRequest -Uri "http://localhost:3000/api/shopify/discover-store" -Method POST -Headers @{"Content-Type" = "application/json"} -Body ($syncPayload | ConvertTo-Json)
    Write-Host "✅ Data Sync: Status $($response.StatusCode)" -ForegroundColor Green
    Write-Host "Response: $($response.Content)" -ForegroundColor Gray
} catch {
    Write-Host "❌ Data Sync failed: $($_.Exception.Message)" -ForegroundColor Red
}

# Test 3: Sync Only Abandoned Checkouts
Write-Host "`n3. Testing POST /api/shopify/discover-store (Sync Checkouts Only)..." -ForegroundColor Yellow
$checkoutPayload = @{
    shop_id = "d5a79116-842f-4a4b-afd6-a4bb225119cf"
    sync_type = "checkouts"
}

try {
    $response = Invoke-WebRequest -Uri "http://localhost:3000/api/shopify/discover-store" -Method POST -Headers @{"Content-Type" = "application/json"} -Body ($checkoutPayload | ConvertTo-Json)
    Write-Host "✅ Checkout Sync: Status $($response.StatusCode)" -ForegroundColor Green
    Write-Host "Response: $($response.Content)" -ForegroundColor Gray
} catch {
    Write-Host "❌ Checkout Sync failed: $($_.Exception.Message)" -ForegroundColor Red
}

# Test 4: Sync Only Customers
Write-Host "`n4. Testing POST /api/shopify/discover-store (Sync Customers Only)..." -ForegroundColor Yellow
$customerPayload = @{
    shop_id = "d5a79116-842f-4a4b-afd6-a4bb225119cf"
    sync_type = "customers"
}

try {
    $response = Invoke-WebRequest -Uri "http://localhost:3000/api/shopify/discover-store" -Method POST -Headers @{"Content-Type" = "application/json"} -Body ($customerPayload | ConvertTo-Json)
    Write-Host "✅ Customer Sync: Status $($response.StatusCode)" -ForegroundColor Green
    Write-Host "Response: $($response.Content)" -ForegroundColor Gray
} catch {
    Write-Host "❌ Customer Sync failed: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host "`n🎉 Shopify Discovery Testing Complete!" -ForegroundColor Green
Write-Host "`n📝 Notes:" -ForegroundColor Cyan
Write-Host "- Store discovery will analyze your Shopify store structure" -ForegroundColor Gray
Write-Host "- Data sync will pull live data with full metadata" -ForegroundColor Gray
Write-Host "- Products, images, variants, and customer data will be included" -ForegroundColor Gray
Write-Host "- Abandoned checkouts will be synced to your database" -ForegroundColor Gray
Write-Host "- Check the dashboard to see the real data!" -ForegroundColor Gray 