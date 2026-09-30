$ErrorActionPreference = 'SilentlyContinue'
try {
  $resp = Invoke-WebRequest -Uri 'http://localhost:3001/safety-station/list' -UseBasicParsing -TimeoutSec 10
  Write-Output ("status={0}" -f $resp.StatusCode)
  Write-Output $resp.Content
} catch {
  $r = $_.Exception.Response
  if ($r) {
    Write-Output ("status={0}" -f [int]$r.StatusCode)
    $stream = $r.GetResponseStream()
    if ($stream) {
      $reader = New-Object System.IO.StreamReader($stream)
      Write-Output ($reader.ReadToEnd())
    }
  } else {
    Write-Output ("error: {0}" -f $_.Exception.Message)
  }
}
