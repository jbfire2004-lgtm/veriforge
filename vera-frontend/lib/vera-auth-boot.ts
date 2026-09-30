/** True while client auth is still hydrating the API bearer token (suppress login redirects). */
let bootstrapping = false;
let bootstrapAccessToken: string | undefined;

export function setVeraAuthBootstrapping(value: boolean): void {
  bootstrapping = value;
}

export function isVeraAuthBootstrapping(): boolean {
  return bootstrapping;
}

export function setVeraBootstrapAccessToken(token: string | undefined): void {
  bootstrapAccessToken = token;
}

export function getVeraBootstrapAccessToken(): string | undefined {
  return bootstrapAccessToken;
}
