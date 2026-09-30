/** API contract definition (§2). */
export type HttpMethod = "GET" | "POST" | "PUT" | "PATCH" | "DELETE";

export type ApiAuthMode = "required" | "optional" | "public";

export type ApiContractDefinition = {
  id: string;
  endpoint: string;
  method: HttpMethod;
  auth: ApiAuthMode;
  description: string;
  query?: Record<string, string>;
  params?: Record<string, string>;
  body?: Record<string, string>;
  tags?: string[];
};
