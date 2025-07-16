# postpackage.ps1
$packagePath = "dist\\DeviceIDToolkit-win32-x64"
$user = "$env:USERNAME"

Write-Host "Taking ownership of: $packagePath"
takeown /F $packagePath /R /D Y | Out-Null

Write-Host "Setting ownership to: $user"
icacls $packagePath /setowner "$user" /T | Out-Null

Write-Host "Granting full control to: $user"
icacls $packagePath /grant "${user}:(OI)(CI)F" /T | Out-Null

Write-Host "✅ Ownership and permissions set. You can now delete or modify the app."
