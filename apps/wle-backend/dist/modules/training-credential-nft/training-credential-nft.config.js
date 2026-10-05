"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isNftMintEnabled = isNftMintEnabled;
exports.nftStubChainId = nftStubChainId;
function isNftMintEnabled() {
    var _a;
    const raw = (_a = process.env.VERA_NFT_MINT_ENABLED) !== null && _a !== void 0 ? _a : 'false';
    return ['1', 'true', 'yes', 'on'].includes(raw.trim().toLowerCase());
}
function nftStubChainId() {
    var _a;
    return (_a = process.env.VERA_NFT_CHAIN_ID) !== null && _a !== void 0 ? _a : 'vera-stub';
}
//# sourceMappingURL=training-credential-nft.config.js.map