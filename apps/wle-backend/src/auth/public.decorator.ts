import { SetMetadata } from '@nestjs/common';

export const IS_PUBLIC_KEY = 'vera_public';

/** Skip JWT — use only for deliberate public endpoints (verify, kiosk reads, legacy compat, etc.). */
export const Public = () => SetMetadata(IS_PUBLIC_KEY, true);
