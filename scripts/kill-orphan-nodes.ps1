$ErrorActionPreference = 'SilentlyContinue'

$cutoff = (Get-Date).AddMinutes(-5)
Write-Output ("cutoff: {0}" -f $cutoff)

$victims = Get-Process -Name node -ErrorAction SilentlyContinue |
  Where-Object { $_.StartTime -lt $cutoff }

Write-Output ("victims: {0}" -f $victims.Count)

$killed = 0
$failed = 0
foreach ($p in $victims) {
  try {
    Stop-Process -Id $p.Id -Force -ErrorAction Stop
    $killed++
  } catch {
    $failed++
  }
}

Write-Output ("killed: {0}" -f $killed)
Write-Output ("failed: {0}" -f $failed)

$remaining = Get-Process -Name node -ErrorAction SilentlyContinue
Write-Output ("remaining node procs: {0}" -f $remaining.Count)
Write-Output 'done'
