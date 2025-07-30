# Test Settings API
Write-Host "🧪 Testing Settings API..." -ForegroundColor Green

# Test 1: GET Settings
Write-Host "`n1. Testing GET /api/settings..." -ForegroundColor Yellow
try {
    $response = Invoke-WebRequest -Uri "http://localhost:3000/api/settings" -Method GET
    Write-Host "✅ GET Settings: Status $($response.StatusCode)" -ForegroundColor Green
    Write-Host "Response: $($response.Content)" -ForegroundColor Gray
} catch {
    Write-Host "❌ GET Settings failed: $($_.Exception.Message)" -ForegroundColor Red
}

# Test 2: POST Settings (Shop)
Write-Host "`n2. Testing POST /api/settings (Shop)..." -ForegroundColor Yellow
$shopSettings = @{
    section = "shop"
    settings = @{
        shopName = "Test Store Updated"
        shopDomain = "test-store.myshopify.com"
        currency = "EUR"
        timezone = "Europe/London"
        language = "en"
    }
} | ConvertTo-Json -Depth 3

try {
    $response = Invoke-WebRequest -Uri "http://localhost:3000/api/settings" -Method POST -Body $shopSettings -ContentType "application/json"
    Write-Host "✅ POST Shop Settings: Status $($response.StatusCode)" -ForegroundColor Green
    Write-Host "Response: $($response.Content)" -ForegroundColor Gray
} catch {
    Write-Host "❌ POST Shop Settings failed: $($_.Exception.Message)" -ForegroundColor Red
}

# Test 3: Test Connection
Write-Host "`n3. Testing POST /api/settings/test-connection..." -ForegroundColor Yellow
$connectionTest = @{
    shopDomain = "test-store.myshopify.com"
} | ConvertTo-Json

try {
    $response = Invoke-WebRequest -Uri "http://localhost:3000/api/settings/test-connection" -Method POST -Body $connectionTest -ContentType "application/json"
    Write-Host "✅ Test Connection: Status $($response.StatusCode)" -ForegroundColor Green
    Write-Host "Response: $($response.Content)" -ForegroundColor Gray
} catch {
    Write-Host "❌ Test Connection failed: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host "`n🎉 Settings API Testing Complete!" -ForegroundColor Green 