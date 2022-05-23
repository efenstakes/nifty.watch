// SPDX-License-Identifier: MIT
pragma solidity ^0.8.11;



import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/introspection/ERC165Checker.sol";
import "@openzeppelin/contracts/utils/Address.sol";



/// @title NFTCollection
/// @author efenstakes
/// @notice Manages NFT Collections 
/// @dev this contract has logic to store, retrieve and manage NFT market
contract NFTCollection is Ownable {
    // keep track of total collections
    uint256 public totalListings;

    // ad fee
    uint256 public adFee;

    // the nft collections added
    mapping( uint256 => ListedCollection) public listings;

    // map listings to their ids
    mapping( address => uint256 ) public listingIds;



    // structs & enums

    enum CollectionStatus {
        LISTED,
        DELISTED
    }


    /// @notice Listed NFT Collection struct
    /// @dev Listed NFT Collection struct
    /// @param collectionAddress the nft collection address 
    /// @param owner the address that listed collection
    /// @param onAdTill the time until which the collection will be advertised
    /// @param goingLiveOn the date collection goes live
    /// @param mintingOn the date collection starts minting
    /// @param nftsTotal the total number of nfts in the collection
    /// @param is1155 if collection type is ERC1155 or ERC721
    struct ListedCollection {
        address collectionAddress;
        address owner;
        uint256 onAdTill;
        uint256 goingLiveOn;
        uint256 mintingOn;
        uint256 nftsTotal;

        CollectionStatus status;
        bool is1155;
    }



}