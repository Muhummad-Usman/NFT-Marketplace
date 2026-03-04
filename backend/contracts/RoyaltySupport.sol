// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/interfaces/IERC2981.sol";
import "@openzeppelin/contracts/utils/introspection/ERC165.sol";

abstract contract RoyaltySupport is ERC165, IERC2981 {
    struct RoyaltyInfo {
        address recipient;
        uint96 royaltyFraction;
    }

    mapping(uint256 => RoyaltyInfo) private _tokenRoyalties;

    function royaltyInfo(
        uint256 tokenId,
        uint256 salePrice
    ) external view override returns (address receiver, uint256 royaltyAmount) {
        RoyaltyInfo memory royalty = _tokenRoyalties[tokenId];
        receiver = royalty.recipient;
        royaltyAmount = (salePrice * royalty.royaltyFraction) / 10000;
    }

    function _setTokenRoyalty(
        uint256 tokenId,
        address recipient,
        uint96 royaltyFraction
    ) internal {
        require(royaltyFraction <= 10000, "Royalty: >10000");
        _tokenRoyalties[tokenId] = RoyaltyInfo(recipient, royaltyFraction);
    }

    // FIXED: Proper override syntax
    function supportsInterface(
        bytes4 interfaceId
    ) public view virtual override(ERC165, IERC165) returns (bool) {
        return
            interfaceId == type(IERC2981).interfaceId ||
            super.supportsInterface(interfaceId);
    }
}
