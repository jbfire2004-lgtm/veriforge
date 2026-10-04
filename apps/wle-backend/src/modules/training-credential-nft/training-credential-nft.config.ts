/** NFT minting disabled by default in dev unless explicitly enabled. */
export function isNftMintEnabled(): boolean {
  const raw = process.env.VERA_NFT_MINT_ENABLED ?? 'false';
  return ['1', 'true', 'yes', 'on'].includes(raw.trim().toLowerCase());
}

export function nftStubChainId(): string {
  return process.env.VERA_NFT_CHAIN_ID ?? 'vera-stub';
}
