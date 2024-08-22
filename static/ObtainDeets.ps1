param(
    [String]$param1
)

$name = Get-CimInstance -Namespace root\CIMV2 -Class Win32_PnPEntity | 
where {$_.Description -Like "$param1" } | 
select Description, HardwareID, Manufacturer | ConvertTo-Json

Write-Output $name