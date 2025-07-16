param(
    [string]$param1,
    [string]$columns = "Description,HardwareID,Manufacturer"
)

# Split and clean column list
$columnList = $columns -split ',' | Where-Object { $_.Trim() -ne '' }

# Query devices
$devices = Get-CimInstance -Namespace root\CIMV2 -Class Win32_PnPEntity |
    Where-Object { $_.Description -like "$param1" }

# Select properties only if columns exist
if ($columnList.Count -gt 0) {
    $devices = $devices | Select-Object -Property $columnList
}

# Ensure array output
if ($devices -isnot [System.Collections.IEnumerable] -or $devices -is [string]) {
    $devices = @($devices)
}

# Convert to JSON
$devices | ConvertTo-Json