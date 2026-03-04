// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/IERC721.sol";
import "@openzeppelin/contracts/token/ERC1155/IERC1155.sol";
import "@openzeppelin/contracts/interfaces/IERC2981.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract NFTMarketplace is ReentrancyGuard, Ownable {
    struct Listing {
        address seller;
        address tokenAddress;
        uint256 tokenId;
        uint256 price;
        uint256 amount;
        bool isERC1155;
        bool active;
    }

    uint256 public listingCounter;
    mapping(uint256 => Listing) public listings;
    uint256 public platformFee = 250;
    address public feeRecipient;

    event Listed(
        uint256 indexed listingId,
        address indexed seller,
        address indexed tokenAddress,
        uint256 tokenId,
        uint256 price,
        uint256 amount,
        bool isERC1155
    );

    event Purchased(
        uint256 indexed listingId,
        address indexed buyer,
        address indexed seller,
        uint256 price
    );

    event Cancelled(uint256 indexed listingId);

    constructor(address _feeRecipient) Ownable(msg.sender) {
        feeRecipient = _feeRecipient;
    }

    function listToken(
        address tokenAddress,
        uint256 tokenId,
        uint256 price,
        uint256 amount,
        bool isERC1155
    ) external nonReentrant returns (uint256) {
        require(price > 0, "Price must be > 0");

        if (isERC1155) {
            IERC1155 token = IERC1155(tokenAddress);
            require(
                token.balanceOf(msg.sender, tokenId) >= amount,
                "Insufficient balance"
            );
            require(
                token.isApprovedForAll(msg.sender, address(this)),
                "Marketplace not approved"
            );
        } else {
            IERC721 token = IERC721(tokenAddress);
            require(token.ownerOf(tokenId) == msg.sender, "Not token owner");
            require(
                token.getApproved(tokenId) == address(this) ||
                    token.isApprovedForAll(msg.sender, address(this)),
                "Marketplace not approved"
            );
        }

        listingCounter++;
        listings[listingCounter] = Listing({
            seller: msg.sender,
            tokenAddress: tokenAddress,
            tokenId: tokenId,
            price: price,
            amount: amount,
            isERC1155: isERC1155,
            active: true
        });

        emit Listed(
            listingCounter,
            msg.sender,
            tokenAddress,
            tokenId,
            price,
            amount,
            isERC1155
        );

        return listingCounter;
    }

    function purchaseToken(uint256 listingId) external payable nonReentrant {
        Listing storage listing = listings[listingId];
        require(listing.active, "Listing not active");
        require(msg.value >= listing.price, "Insufficient payment");

        uint256 platformFeeAmount = (listing.price * platformFee) / 10000;
        uint256 sellerAmount = listing.price - platformFeeAmount;

        // Handle royalties
        uint256 royaltyAmount = 0;
        address royaltyRecipient = address(0);

        try
            IERC2981(listing.tokenAddress).royaltyInfo(
                listing.tokenId,
                listing.price
            )
        returns (address recipient, uint256 amount) {
            if (recipient != address(0) && amount > 0) {
                royaltyAmount = amount;
                royaltyRecipient = recipient;
                sellerAmount -= royaltyAmount;
            }
        } catch {}
        // Transfer payment
        if (royaltyAmount > 0 && royaltyRecipient != address(0)) {
            payable(royaltyRecipient).transfer(royaltyAmount);
        }
        payable(listing.seller).transfer(sellerAmount);
        payable(feeRecipient).transfer(platformFeeAmount);

        // Transfer token
        if (listing.isERC1155) {
            IERC1155(listing.tokenAddress).safeTransferFrom(
                listing.seller,
                msg.sender,
                listing.tokenId,
                listing.amount,
                ""
            );
        } else {
            IERC721(listing.tokenAddress).safeTransferFrom(
                listing.seller,
                msg.sender,
                listing.tokenId
            );
        }

        listing.active = false;

        emit Purchased(listingId, msg.sender, listing.seller, listing.price);
    }

    function cancelListing(uint256 listingId) external {
        Listing storage listing = listings[listingId];
        require(listing.active, "Listing not active");
        require(listing.seller == msg.sender, "Not seller");

        listing.active = false;
        emit Cancelled(listingId);
    }

    function updatePlatformFee(uint256 newFee) external onlyOwner {
        require(newFee <= 1000, "Fee too high");
        platformFee = newFee;
    }

    function updateFeeRecipient(address newRecipient) external onlyOwner {
        require(newRecipient != address(0), "Invalid address");
        feeRecipient = newRecipient;
    }
}
