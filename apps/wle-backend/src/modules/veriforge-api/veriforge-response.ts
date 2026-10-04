export type ForgeStatus = 'forged' | 'pending' | 'failed' | 'verified';

export type VeriForgeMeta = {
  timestamp: string;
  userId: number | null;
  tenantId: string | null;
  forgeStatus: ForgeStatus;
};

export type VeriForgeSuccess<T> = {
  status: 'ok';
  data: T;
  meta: VeriForgeMeta;
};

export type VeriForgeError = {
  status: 'error';
  data: null;
  error: {
    code: string;
    message: string;
    details?: unknown;
  };
  meta: VeriForgeMeta;
};

export function buildSuccess<T>(
  data: T,
  input: {
    userId?: number | null;
    tenantId?: string | null;
    forgeStatus?: ForgeStatus;
  } = {},
): VeriForgeSuccess<T> {
  return {
    status: 'ok',
    data,
    meta: {
      timestamp: new Date().toISOString(),
      userId: input.userId ?? null,
      tenantId: input.tenantId ?? null,
      forgeStatus: input.forgeStatus ?? 'forged',
    },
  };
}

export function buildError(input: {
  message: string;
  code?: string;
  details?: unknown;
  userId?: number | null;
  tenantId?: string | null;
  forgeStatus?: ForgeStatus;
}): VeriForgeError {
  return {
    status: 'error',
    data: null,
    error: {
      code: input.code ?? 'VERIFORGE_ERROR',
      message: input.message,
      details: input.details,
    },
    meta: {
      timestamp: new Date().toISOString(),
      userId: input.userId ?? null,
      tenantId: input.tenantId ?? null,
      forgeStatus: input.forgeStatus ?? 'failed',
    },
  };
}
