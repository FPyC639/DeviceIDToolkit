$services = Get-CimInstance -ClassName Win32_Service | Select Name, State
$services | ConvertTo-Json