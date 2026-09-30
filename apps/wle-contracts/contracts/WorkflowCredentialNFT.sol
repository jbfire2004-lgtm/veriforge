// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";

/// @title WorkflowCredentialNFT
/// @notice Soulbound ERC721 for safety workflow credentials (matches nft-mint-service ABI).
contract WorkflowCredentialNFT is ERC721, AccessControl {
    bytes32 public constant ADMIN_ROLE = keccak256("ADMIN_ROLE");
    bytes32 public constant MINTER_ROLE = keccak256("MINTER_ROLE");

    uint8 public constant STATUS_ACTIVE = 0;
    uint8 public constant STATUS_EXPIRED = 1;
    uint8 public constant STATUS_REVOKED = 2;

    struct WorkflowData {
        string workflowId;
        string workflowType;
        string issuer;
        uint64 issueDate;
        uint64 expiryDate;
        string workflowHash;
        string veraRecordId;
        uint8 status;
    }

    mapping(uint256 => WorkflowData) public workflows;
    uint256 private _nextTokenId = 1;
    string private _tokenBaseURI;

    event WorkflowMinted(uint256 indexed tokenId, address indexed to, string veraRecordId);
    event WorkflowStatusChanged(uint256 indexed tokenId, uint8 newStatus);

    error InvalidRecipient();
    error InvalidStatus();
    error WorkflowNotFound(uint256 tokenId);
    error InvalidDateRange();
    error Soulbound();

    constructor() ERC721("Vera Workflow Credential", "VWFLOW") {
        _setupRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _setupRole(ADMIN_ROLE, msg.sender);
        _setupRole(MINTER_ROLE, msg.sender);
    }

    function mintWorkflow(address to, WorkflowData calldata data) external onlyRole(MINTER_ROLE) returns (uint256 tokenId) {
        if (to == address(0)) revert InvalidRecipient();
        if (data.status > STATUS_REVOKED) revert InvalidStatus();
        if (data.expiryDate != 0 && data.expiryDate < data.issueDate) revert InvalidDateRange();

        tokenId = _nextTokenId;
        unchecked {
            _nextTokenId = tokenId + 1;
        }

        _safeMint(to, tokenId);
        workflows[tokenId] = data;
        emit WorkflowMinted(tokenId, to, data.veraRecordId);
    }

    function setStatus(uint256 tokenId, uint8 newStatus) external onlyRole(ADMIN_ROLE) {
        if (!_exists(tokenId)) revert WorkflowNotFound(tokenId);
        if (newStatus > STATUS_REVOKED) revert InvalidStatus();
        workflows[tokenId].status = newStatus;
        emit WorkflowStatusChanged(tokenId, newStatus);
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
            revert Soulbound();
        }
    }

    function supportsInterface(bytes4 interfaceId) public view override(ERC721, AccessControl) returns (bool) {
        return super.supportsInterface(interfaceId);
    }
}
