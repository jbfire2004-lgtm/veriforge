// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";

/// @title EquipmentNFT
/// @notice Soulbound ERC721 for equipment identity and certification records.
contract EquipmentNFT is ERC721, AccessControl {
    bytes32 public constant ADMIN_ROLE = keccak256("ADMIN_ROLE");
    bytes32 public constant MINTER_ROLE = keccak256("MINTER_ROLE");

    struct EquipmentData {
        string equipmentId;
        string serialNumber;
        string equipmentType;
        string inspectionHistoryHash;
        uint64 lastInspectionDate;
        uint64 nextDueDate;
        string veraRecordId;
    }

    mapping(uint256 => EquipmentData) public equipmentRecords;
    uint256 private _nextTokenId = 1;
    string private _tokenBaseURI;

    event EquipmentMinted(uint256 indexed tokenId, address indexed to, string veraRecordId);
    event EquipmentUpdated(uint256 indexed tokenId);

    error InvalidRecipient();
    error EquipmentNotFound(uint256 tokenId);
    error InvalidDateRange();
    error SoulboundTransfer();

    constructor() ERC721("Vera Equipment Credential", "VEQUIP") {
        _setupRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _setupRole(ADMIN_ROLE, msg.sender);
        _setupRole(MINTER_ROLE, msg.sender);
    }

    function mintEquipment(address to, EquipmentData calldata data) external onlyRole(MINTER_ROLE) returns (uint256 tokenId) {
        if (to == address(0)) revert InvalidRecipient();
        if (data.nextDueDate != 0 && data.nextDueDate < data.lastInspectionDate) revert InvalidDateRange();

        tokenId = _nextTokenId;
        unchecked {
            _nextTokenId = tokenId + 1;
        }

        _safeMint(to, tokenId);
        equipmentRecords[tokenId] = data;
        emit EquipmentMinted(tokenId, to, data.veraRecordId);
    }

    function updateEquipment(uint256 tokenId, EquipmentData calldata data) external onlyRole(ADMIN_ROLE) {
        if (!_exists(tokenId)) revert EquipmentNotFound(tokenId);
        if (data.nextDueDate != 0 && data.nextDueDate < data.lastInspectionDate) revert InvalidDateRange();
        equipmentRecords[tokenId] = data;
        emit EquipmentUpdated(tokenId);
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
