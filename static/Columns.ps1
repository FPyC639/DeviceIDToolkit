Get-CimInstance -Namespace root\CIMV2 -Class Win32_PnPEntity |
    Get-Member |
    Where-Object { $_.MemberType -like '*Property*' } |
    Select-Object -ExpandProperty Name
