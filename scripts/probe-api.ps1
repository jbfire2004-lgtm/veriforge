$ErrorActionPreference = 'SilentlyContinue'

$base = 'http://localhost:3001'

$probes = @(
  @{ Path = '/api/v1/core/uploads/config'; Method = 'GET' },
  @{ Path = '/api/v1/pm/safety-workflows/definition'; Method = 'GET' },
  @{ Path = '/api/v1/pm/safety-workflows';            Method = 'GET' },
  @{ Path = '/api/v1/core-meeting-records';           Method = 'GET' },
  @{ Path = '/api/v1/core-daily-logs';                Method = 'GET' },
  @{ Path = '/api/v1/core-compliance-notes';          Method = 'GET' },
  @{ Path = '/api/v1/core-action-items';              Method = 'GET' },
  @{ Path = '/api/v1/core-site-risks';                Method = 'GET' },
  @{ Path = '/api/v1/safety-observations';            Method = 'GET' },
  @{ Path = '/api/v1/sites';                          Method = 'GET' },
  @{ Path = '/api/v1/site-contacts';                  Method = 'GET' },
  @{ Path = '/training-records';                      Method = 'GET' },
  @{ Path = '/workers';                               Method = 'GET' },
  @{ Path = '/companies';                             Method = 'GET' },
  @{ Path = '/equipment';                             Method = 'GET' },
  @{ Path = '/equipment-assignments/worker/1';        Method = 'GET' },
  @{ Path = '/certifications';                        Method = 'GET' },
  @{ Path = '/incidents';                             Method = 'GET' },
  @{ Path = '/safety-workflow';                       Method = 'GET' },
  @{ Path = '/admin/dashboard';                       Method = 'GET' },
  @{ Path = '/supervisor/dashboard';                  Method = 'GET' },
  @{ Path = '/training-ingestion/runs/0';             Method = 'GET' },
  @{ Path = '/api/v1/core/verification/training/0';   Method = 'GET' },
  @{ Path = '/phase1/dashboard-summary';              Method = 'GET' },
  @{ Path = '/qr/scan';                               Method = 'POST' },
  @{ Path = '/training';                              Method = 'GET' },
  @{ Path = '/training/worker/1';                     Method = 'GET' },
  @{ Path = '/users';                                 Method = 'GET' },
  @{ Path = '/analytics';                             Method = 'GET' },
  @{ Path = '/notifications';                         Method = 'GET' },
  @{ Path = '/audit';                                 Method = 'GET' },
  @{ Path = '/access/site';                           Method = 'GET' },
  @{ Path = '/training-requirements';                 Method = 'GET' },
  @{ Path = '/training-dashboard';                    Method = 'GET' },
  @{ Path = '/equipment-training-requirements/equipment/1'; Method = 'GET' },
  @{ Path = '/documents/worker/1';                    Method = 'GET' },
  @{ Path = '/verify/worker/1';                       Method = 'GET' },
  @{ Path = '/verification/logs/recent';              Method = 'GET' },
  @{ Path = '/safety-station/list';                   Method = 'GET' }
)

$results = foreach ($p in $probes) {
  $url = "$base$($p.Path)"
  try {
    $resp = Invoke-WebRequest -Uri $url -Method $p.Method -UseBasicParsing -TimeoutSec 15 -MaximumRedirection 0
    [PSCustomObject]@{
      Path   = $p.Path
      Status = $resp.StatusCode
      Bytes  = $resp.RawContentLength
    }
  } catch {
    $code = $null
    if ($_.Exception.Response) {
      try { $code = [int]$_.Exception.Response.StatusCode } catch {}
    }
    [PSCustomObject]@{
      Path   = $p.Path
      Status = $code
      Bytes  = 0
    }
  }
}
$results | Format-Table -AutoSize
