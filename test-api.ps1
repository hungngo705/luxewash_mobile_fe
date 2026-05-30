# Test the LuxeWash login API
$body = @{
    phoneOrEmail = "0999999999"
    password = "Admin@123"
} | ConvertTo-Json

Write-Host "=== LOGIN ===" -ForegroundColor Cyan
$login = Invoke-WebRequest -Uri "https://smartwash-be.onrender.com/api/v1/auth/login" -Method POST -ContentType "application/json" -Body $body -UseBasicParsing
Write-Host "Status:" $login.StatusCode
Write-Host "Response:" $login.Content
Write-Host ""

# Parse token
try {
    $loginData = $login.Content | ConvertFrom-Json
    $token = $loginData.data.Token
    Write-Host "Token: $token"
    Write-Host ""

    Write-Host "=== GET PROFILE ===" -ForegroundColor Cyan
    $headers = @{ Authorization = "Bearer $token" }
    $profile = Invoke-WebRequest -Uri "https://smartwash-be.onrender.com/api/v1/users/me" -Method GET -Headers $headers -UseBasicParsing
    Write-Host "Status:" $profile.StatusCode
    Write-Host "Response:" $profile.Content
} catch {
    Write-Host "Error:" $_.Exception.Message -ForegroundColor Red
    Write-Host "Response:" $_.Exception.Response
}
