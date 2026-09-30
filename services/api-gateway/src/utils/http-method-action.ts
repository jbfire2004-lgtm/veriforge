const METHOD_ACTION: Record<string, string> = {
  GET: 'read',
  HEAD: 'read',
  OPTIONS: 'read',
  POST: 'create',
  PUT: 'update',
  PATCH: 'update',
  DELETE: 'delete',
};

export function actionFromMethod(method: string): string {
  return METHOD_ACTION[method.toUpperCase()] ?? 'execute';
}
