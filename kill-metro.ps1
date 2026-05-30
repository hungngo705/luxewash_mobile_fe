$pids = @()
Get-NetTCPConnection -LocalPort 8081 -ErrorAction SilentlyContinue | ForEach-Object { $pids += $_.OwningProcess }
foreach ($p in $pids) { taskkill /F /PID $p 2>$null }
Remove-Item -Recurse -Force "F:\Study\Do An\Git\LuxeWash_Mobile_FE\.expo" -ErrorAction SilentlyContinue
Write-Host "Done"
