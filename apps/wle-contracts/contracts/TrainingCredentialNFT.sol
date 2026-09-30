// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";

/// @title TrainingCredentialNFT
/// @notice ERC721 contract for issuing verifiable training credentials on Vera.
/// @dev Designed for Polygon-compatible networks (including Telcoin/Polygon environments).
contract TrainingCredentialNFT is ERC721, AccessControl {
    bytes32 public constant ADMIN_ROLE = keccak256("ADMIN_ROLE");
    bytes32 public constant MINTER_ROLE = keccak256("MINTER_ROLE");

    uint8 public constant STATUS_ACTIVE = 0;
    uint8 public constant STATUS_EXPIRED = 1;
    uint8 public constant STATUS_REVOKED = 2;

    struct CredentialData {
        string workerIdHash;
        string trainingType;
        string issuer;
        uint64 issueDate;
        uint64 expiryDate;
        string certificateHash;
        string veraRecordId;
        uint8 status;
    }

    mapping(uint256 => CredentialData) public credentials;
    uint256 private _nextTokenId = 1;
    string private _tokenBaseURI;

    event CredentialMinted(uint256 indexed tokenId, address indexed to, string veraRecordId);
    event CredentialStatusChanged(uint256 indexed tokenId, uint8 newStatus);
    event CredentialRevoked(uint256 indexed tokenId, string reason);

    error InvalidRecipient();
    error InvalidStatus();
    error CredentialNotFound(uint256 tokenId);
    error EmptyReason();
    error InvalidDateRange();
    error SoulboundTransfer();

    constructor() ERC721("Vera Training Credential", "VTCRED") {
        _setupRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _setupRole(ADMIN_ROLE, msg.sender);
        _setupRole(MINTER_ROLE, msg.sender);
    }

    function mintCredential(address to, CredentialData calldata data) external onlyRole(MINTER_ROLE) returns (uint256 tokenId) {
        if (to == address(0)) revert InvalidRecipient();
        if (data.status > STATUS_REVOKED) revert InvalidStatus();
        if (data.expiryDate != 0 && data.expiryDate < data.issueDate) revert InvalidDateRange();

        tokenId = _nextTokenId;
        unchecked {
            _nextTokenId = tokenId + 1;
        }

        _safeMint(to, tokenId);
        credentials[tokenId] = data;

        emit CredentialMinted(tokenId, to, data.veraRecordId);
    }

    function setStatus(uint256 tokenId, uint8 newStatus) external onlyRole(ADMIN_ROLE) {
        if (!_exists(tokenId)) revert CredentialNotFound(tokenId);
        if (newStatus > STATUS_REVOKED) revert InvalidStatus();

        credentials[tokenId].status = newStatus;
        emit CredentialStatusChanged(tokenId, newStatus);
    }

    function revokeCredential(uint256 tokenId, string calldata reason) external onlyRole(ADMIN_ROLE) {
        if (!_exists(tokenId)) revert CredentialNotFound(tokenId);
        if (bytes(reason).length == 0) revert EmptyReason();

        credentials[tokenId].status = STATUS_REVOKED;

        emit CredentialStatusChanged(tokenId, STATUS_REVOKED);
        emit CredentialRevoked(tokenId, reason);
    }

    function setBaseURI(string calldata newBaseURI) external onlyRole(ADMIN_ROLE) {
        _tokenBaseURI = newBaseURI;
    }

    function _baseURI() internal view override returns (string memory) {
        return _tokenBaseURI;
    }

    function _beforeTokenTransfer(
        address from,
        address to,
        uint256 tokenId,
        uint256 batchSize
    ) internal override {
        super._beforeTokenTransfer(from, to, tokenId, batchSize);
        if (from != address(0) && to != address(0)) {
            revert SoulboundTransfer();
        }
    }

    function supportsInterface(bytes4 interfaceId) public view override(ERC721, AccessControl) returns (bool) {
        return super.supportsInterface(interfaceId);
    }
}
