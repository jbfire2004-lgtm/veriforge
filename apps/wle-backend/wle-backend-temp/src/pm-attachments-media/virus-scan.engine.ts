export class VirusScanEngine {
  scan(input: { mimeType?: string; fileName?: string }): {
    status: 'passed' | 'failed' | 'skipped';
    reason?: string;
  } {
    const mime = (input.mimeType ?? '').toLowerCase();
    const ext = (input.fileName ?? '').split('.').pop()?.toLowerCase() ?? '';
    const blocked =
      ['exe', 'bat', 'cmd', 'msi', 'dll', 'scr'].includes(ext) ||
      mime.includes('executable') ||
      mime === 'application/x-msdownload';

    if (blocked) {
      return {
        status: 'failed',
        reason: 'Blocked file type (virus scan policy)',
      };
    }
    if (!mime) return { status: 'skipped', reason: 'No MIME — scan skipped' };
    return { status: 'passed' };
  }
}
