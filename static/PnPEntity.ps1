$name = (Get-CimInstance -Namespace root\CIMV2 -Class Win32_PnPEntity | Select-Object Description).Description
Write-Output $name