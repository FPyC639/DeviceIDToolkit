$name = (Get-CimInstance -Namespace root\CIMV2 -Class Win32_PnPEntity | select Description).Description
Write-Output $name