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




    // events
    

    /// @notice Event emitted when a collection is listed
    /// @dev Event emitted when a collection is listed
    /// @param marketID the collection id in the market
    /// @param name the collection name
    /// @param avatars the collection avatar
    /// @param socials the collection socials
    event OnNewListingEvent(
        uint256 marketID,
        string name,
        string[] avatars,
        string[] socials
    );
    

    /// @notice Event emitted when a collection is listed
    /// @dev Event emitted when a collection is listed
    /// @param marketID the collection id in the market
    /// @param owner the nft collection lister's address
    /// @param is1155 if collection type is ERC1155 or ERC721
    event OnListingChangeEvent(
        uint256 marketID,
        address owner,
        bool is1155      
    );


    /// @notice Event emitted when a collection metadata is updated
    /// @dev Event emitted when a collection metadata is updated
    /// @param name the collection name
    /// @param avatars the collection avatars
    /// @param socials the collection socials
    /// @param tags the collection tags
    event OnListingMetadataChangeEvent(
        uint256 marketID,
        string name,
        string[] avatars,
        string[] socials,
        string[] tags
    );

    
    /// @notice Event when collection status is updated
    /// @dev Event when collection status is updated
    /// @param marketID the collection id in the market
    /// @param status the new collection status
    event OnListingStatusChangeEvent(
        uint256 indexed marketID,
        CollectionStatus status
    );


    /// @notice Event emitted when collection ad time is extended
    /// @dev Event emitted when collection ad time is extended
    /// @param marketID the collection id in the market
    /// @param newAdTimeTill the new ad time end
    event OnAdTimeExtendedEvent(
        uint256 indexed marketID,
        uint256 newAdTimeTill
    );

    /// @notice Event emitted when collection ad time is extended
    /// @dev Event emitted when collection ad time is extended
    /// @param marketIDs the collection id in the market
    /// @param newAdTimesTill the new ad time end
    event OnAdTimesExtendedEvent(
        uint256[] indexed marketIDs,
        uint256[] newAdTimesTill
    );



    // constructor
    constructor() { }
    

    

    /// @notice Ensure collection listing exists
    /// @dev Ensure collection listing exists
    /// @param _nftId the collection id 
    modifier ensureListingExists(uint256 _nftId) {
        bool isExistent = (_nftId > 0) && _nftId <= totalListings;
        require( isExistent , "No Collection" );
        _;
    }

    /// @notice Ensure only lister is calling a function
    /// @dev Ensure only lister is calling a function
    /// @param _collectionId the collection id 
    /// @param _owner the owner address
    modifier onlyListingOwner(uint256 _collectionId, address _owner) {
        require( listings[_collectionId].owner == _owner, "Only Owner is allowed" );
        _;
    }
    


}