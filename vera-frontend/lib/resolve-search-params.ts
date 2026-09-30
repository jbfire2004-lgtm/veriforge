/** Next.js 16: `searchParams` in page props may be a Promise — unwrap safely. */
export async function resolveSearchParams<T extends Record<string, string | undefined>>(
  searchParams: T | Promise<T>,
): Promise<T> {
  return searchParams instanceof Promise ? searchParams : Promise.resolve(searchParams);
}
