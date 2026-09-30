$ErrorActionPreference = 'SilentlyContinue'

$ports = 3000, 3001
$lines = netstat -ano | Select-String -Pattern 'LISTENING'
foreach ($port in $ports) {
  $matches2 = $lines | Where-Object { $_ -match (":{0}\s" -f $port) }
  foreach ($m in $matches2) {
    $tokens = ($m.ToString() -split '\s+') | Where-Object { $_ -ne '' }
    $pidVal = $tokens[-1]
    try {
      $proc = Get-Process -Id ([int]$pidVal) -ErrorAction SilentlyContinue
      if ($proc) {
        Stop-Process -Id $proc.Id -Force
        Write-Output ("killed port {0} pid {1} ({2})" -f $port, $proc.Id, $proc.ProcessName)
      }
    } catch {}
  }
}

$procs = Get-CimInstance Win32_Process -Filter "Name='node.exe' OR Name='npm.cmd' OR Name='cmd.exe'"
foreach ($p in $procs) {
  if ($p.CommandLine -and ($p.CommandLine -match 'dev-parallel|nest start|next dev|start:dev')) {
    try {
      Stop-Process -Id $p.ProcessId -Force
      Write-Output ("killed cmd pid {0} ({1})" -f $p.ProcessId, $p.Name)
    } catch {}
  }
}

Write-Output 'done'
