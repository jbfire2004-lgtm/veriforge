import { SetMetadata } from '@nestjs/common';

export const API_SUCCESS_KEY = 'vera:api:success';

/** Opt-in wrapper to emit `{ status: 'success', data, meta }` envelope (§2). */
export const ApiSuccess = () => SetMetadata(API_SUCCESS_KEY, true);
