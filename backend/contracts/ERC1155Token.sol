// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC1155/ERC1155.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "./RoyaltySupport.sol";

contract ERC1155Token is ERC1155, Ownable, RoyaltySupport {
    string public name;
    string public symbol;
    uint256 private _currentTokenId = 0;

    mapping(uint256 => string) private _tokenURIs;

    // CHANGED: Renamed parameter from 'uri' to 'baseUri' to avoid shadowing
    constructor(
        string memory _name,
        string memory _symbol,
        string memory baseUri
    ) ERC1155(baseUri) Ownable(msg.sender) {
        // ADDED: msg.sender for Ownable
        name = _name;
        symbol = _symbol;
    }

    // In ERC1155Token.sol - CHANGE THE MINT FUNCTION:
    function mint(
        address account,
        uint256 amount,
        string memory tokenURI,
        address royaltyRecipient,
        uint96 royaltyFraction,
        bytes memory data
    ) public onlyOwner {
        uint256 tokenId = ++_currentTokenId;
        _mint(account, tokenId, amount, data);
        _tokenURIs[tokenId] = tokenURI;
        _setTokenRoyalty(tokenId, royaltyRecipient, royaltyFraction);
        // Don't return anything
    }
    function mintBatch(
        address to,
        uint256[] memory amounts,
        string[] memory tokenURIs,
        address royaltyRecipient,
        uint96 royaltyFraction,
        bytes memory data
    ) public onlyOwner {
        require(tokenURIs.length == amounts.length, "Length mismatch");

        uint256[] memory tokenIds = new uint256[](amounts.length);
        for (uint256 i = 0; i < amounts.length; i++) {
            tokenIds[i] = ++_currentTokenId;
            _tokenURIs[tokenIds[i]] = tokenURIs[i];
            _setTokenRoyalty(tokenIds[i], royaltyRecipient, royaltyFraction);
        }

        _mintBatch(to, tokenIds, amounts, data);
        // Don't return anything
    }

    function uri(uint256 tokenId) public view override returns (string memory) {
        return _tokenURIs[tokenId];
    }

    function supportsInterface(
        bytes4 interfaceId
    ) public view override(ERC1155, RoyaltySupport) returns (bool) {
        return super.supportsInterface(interfaceId);
    }
}
