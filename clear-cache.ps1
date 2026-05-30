taskkill /F /IM node.exe 2>$null
Remove-Item -Recurse -Force "F:\Study\Do An\Git\LuxeWash_Mobile_FE\.expo" -ErrorAction SilentlyContinue
Write-Host "Metro cache cleared"
