/** Next.js 16: dynamic route `params` may be a Promise. */
export async function resolveRouteParams<T extends Record<string, string | string[]>>(
  params: T | Promise<T>,
): Promise<T> {
  return params instanceof Promise ? params : Promise.resolve(params);
}
