$ErrorActionPreference = 'SilentlyContinue'

$routes = @(
  '/admin',
  '/admin/workers',
  '/admin/companies',
  '/admin/equipment',
  '/admin/certifications',
  '/admin/training',
  '/admin/incidents',
  '/admin/documents/upload',
  '/admin/analytics',
  '/core/training-ingest',
  '/core/verification',
  '/core/upload',
  '/equipment-assignments',
  '/site-contacts',
  '/pm/safety',
  '/training-provider',
  '/dashboard',
  '/companies',
  '/wallet'
)

$results = foreach ($r in $routes) {
  $url = "http://localhost:3000$r"
  try {
    $resp = Invoke-WebRequest -Uri $url -MaximumRedirection 0 -UseBasicParsing -TimeoutSec 30
    [PSCustomObject]@{
      Route  = $r
      Status = $resp.StatusCode
      Note   = ''
    }
  } catch {
    $code = $null
    $note = $_.Exception.Message
    if ($_.Exception.Response) {
      try { $code = [int]$_.Exception.Response.StatusCode } catch {}
    }
    [PSCustomObject]@{
      Route  = $r
      Status = $code
      Note   = $note
    }
  }
}

$results | Format-Table -AutoSize
