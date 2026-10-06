import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpStatus,
} from '@nestjs/common';
import { toCanonicalApiError } from '@vera/api-contract';
import { MulterError } from 'multer';
import { getCoreUploadConfig } from '../core-upload.config';

/**
 * Maps multer errors (e.g. size limit) to JSON matching {@link HttpExceptionFilter} shape.
 */
@Catch(MulterError)
export class MulterExceptionFilter implements ExceptionFilter {
  catch(exception: MulterError, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse();
    const maxBytes = getCoreUploadConfig().maxBytes;
    const mib = Math.round(maxBytes / (1024 * 1024));

    if (exception.code === 'LIMIT_FILE_SIZE') {
      const message = `File too large (max ${maxBytes} bytes / ~${mib} MiB). Increase VERA_CORE_UPLOAD_MAX_BYTES if needed.`;
      const error = toCanonicalApiError(message, HttpStatus.PAYLOAD_TOO_LARGE);
      return response.status(HttpStatus.PAYLOAD_TOO_LARGE).json({
        status: 'error',
        success: false,
        statusCode: HttpStatus.PAYLOAD_TOO_LARGE,
        code: error.code,
        message: error.message,
        errors: [
          { code: error.code ?? 'ERROR', message: error.message },
        ],
        error,
        timestamp: new Date().toISOString(),
      });
    }

    const error = toCanonicalApiError(
      exception.message || 'Upload rejected',
      HttpStatus.BAD_REQUEST,
    );
    return response.status(HttpStatus.BAD_REQUEST).json({
      status: 'error',
      success: false,
      statusCode: HttpStatus.BAD_REQUEST,
      code: error.code,
      message: error.message,
      errors: [{ code: error.code ?? 'ERROR', message: error.message }],
      error,
      timestamp: new Date().toISOString(),
    });
  }
}
