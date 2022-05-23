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
    


    /// @notice Get ammount of ether in contract
    /// @dev Get ammount of ether in contract
    function getEther() public view onlyOwner returns(uint256) {
        return address(this).balance;
    }

    
    /// @notice Set ad fee for an nft
    /// @dev Set ad fee for an nft
    /// @param _fee the fee to put an nft on ad
    function setAdFee(uint256 _fee) public onlyOwner returns(bool) {
        adFee = _fee;
        return true;
    }
    
    
    

        
    /// @notice Add listing
    /// @dev Add listing
    /// @param _name the collection name
    /// @param _avatars the collection avatars
    /// @param _collectionAddress the collection contract address
    /// @param _goingLiveOn the date collection goes live
    /// @param _mintingOn the date minting starts for collection
    /// @param _nftsTotal the total nfts in the collection
    /// @param _socials the collection socials
    // ensure msg.value is more than _adOffer
    // calculate new id
    // ensure collection is not added already
    // check if collection is ERC 721/1155, exit if not either
    // calculate ad time
    // create collection
    function addListing( string calldata _name, string[] calldata _avatars, address _collectionAddress, uint256 _goingLiveOn, uint256 _mintingOn, uint256 _nftsTotal, string[] calldata _socials ) external payable {
        // ensure collection is not added already
        require( listingIds[_collectionAddress] == 0, "Collection already added" );

        // check if its ERC721 or ERC1155
        bool is1155 = ERC165Checker.supportsInterface(_collectionAddress, 0xd9b67a26);
        bool is721 = ERC165Checker.supportsInterface(_collectionAddress, 0x80ac58cd);

        // ensure either ERC721 or ERC1155
        require( is1155 || is721, "Invalid Collection" );

        // calculate new id
        totalListings += 1;

        // add collection
        listings[totalListings] = ListedCollection({
            collectionAddress: _collectionAddress,
            goingLiveOn: _goingLiveOn,
            mintingOn: _mintingOn,
            nftsTotal: _nftsTotal,
            status: CollectionStatus.LISTED,
            is1155: is1155,
            owner: msg.sender,
            onAdTill: 0
        });
        listingIds[_collectionAddress] = totalListings;

        // emit event
        emit OnNewListingEvent(
            totalListings,
            _name,
            _avatars,
            _socials
        );
    }

     
            
        
    /// @notice Update listing Metadata
    /// @dev Update listing Metadata
    /// @param _name the collection name
    /// @param _avatars the collection avatars
    /// @param _socials the new socials
    /// @param _tags the new tags
    // ensure listing exists
    // calculate new id
    // ensure collection is not added already
    // check if collection is ERC 721/1155, exit if not either
    // create collection
    function updateListingMetas( uint256 _collectionId, string calldata _name, string[] calldata _avatars, string[] calldata _socials, string[] calldata _tags) external payable ensureListingExists(_collectionId) onlyListingOwner(_collectionId, msg.sender) returns(bool) {

        emit OnListingMetadataChangeEvent(
            _collectionId,
            _name,
            _avatars,
            _socials,
            _tags
        );

        return true;
    }

    
        
    /// @notice Update listing
    /// @dev Update listing
    /// @param _collectionAddress the collection contract address
    /// @param _goingLiveOn the date collection goes live
    /// @param _mintingOn the date minting starts for collection
    /// @param _nftsTotal the total nfts in the collection
    // ensure listing exists
    // calculate new id
    // ensure collection is not added already
    // check if collection is ERC 721/1155, exit if not either
    // create collection
    function updateListing( uint256 _collectionId, address _collectionAddress, uint256 _goingLiveOn, uint256 _mintingOn, uint256 _nftsTotal ) external payable ensureListingExists(_collectionId) returns(bool) {
        // get listing
        ListedCollection storage _collection = listings[_collectionId];

        // check if its ERC721 or ERC1155
        bool is1155 = ERC165Checker.supportsInterface(_collectionAddress, 0xd9b67a26);
        bool is721 = ERC165Checker.supportsInterface(_collectionAddress, 0x80ac58cd);

        // ensure either ERC721 or ERC1155
        require( is1155 || is721, "Invalid Collection" );


        // reset id for old collection address
        listingIds[_collection.collectionAddress] = 0;


        // set id for new collection
        listingIds[_collectionAddress] = _collectionId;


        // update collection
        _collection.collectionAddress = _collectionAddress;
        _collection.goingLiveOn = _goingLiveOn;
        _collection.mintingOn = _mintingOn;
        _collection.nftsTotal = _nftsTotal;
        _collection.is1155 = is1155;

        
        // emit event
        emit OnListingChangeEvent(
            _collectionId,
            msg.sender,
            is1155      
        );

        return true;
    }

    

        
    /// @notice Update listing status
    /// @dev Update listing status
    /// @param _collectionId the collection id
    /// @param _status the collection status
    // ensure listing exists
    function updateListingStatus( uint256 _collectionId, CollectionStatus _status ) external ensureListingExists(_collectionId) onlyListingOwner(_collectionId, msg.sender) returns(bool) {
        // get listing
        ListedCollection storage _collection = listings[_collectionId];

        // update collection
        _collection.status = _status;

        // emit event
        emit OnListingStatusChangeEvent(
            _collectionId,
            _status    
        );

        return true;
    }
     

     
    
    /// @notice Put collections on ad
    /// @dev Put collections on ad
    /// @param _collectionIds the array of collection ids
    /// @param _adOffers the array of _adOffers for each collection ids
    // ensure _collectionIds and _adOffers arrays have same length
    // ensure enough eth is passed
    function putOnAdBatch(uint256[] calldata _collectionIds, uint256[] calldata _adOffers) external payable returns(bool) {
        // ensure _collectionIds and _adOffers arrays have same length
        require( _collectionIds.length == _adOffers.length, "Array lengths differ" );

        // ensure eth is equal to _adOffers
        uint256 _totalOffers = 0;
        for (uint256 index = 0; index < _adOffers.length; index++) {
            // ensure fee is enough for atleast an hour
            require( _adOffers[index] > adFee, "Low AdFee" );
            
            _totalOffers += _adOffers[index];
        }
        
        // ensure enough eth is passed
        require( msg.value >= _totalOffers, "No Ad Fee" );
        

        // ad times for the collections
        uint256 collectionsTotal = _collectionIds.length;
        uint256[] memory _adTimes = new uint256[](collectionsTotal);

        for (uint256 index = 0; index < collectionsTotal; index++) {
            uint256 currentCollectionId = _collectionIds[index];

            // check if collection exists
            bool isExistent = (currentCollectionId > 0) && currentCollectionId <= totalListings;
            require( isExistent , "No Collection" );

            // put on ads
            ( bool success, uint256 newAdTimeTill ) = _putOnAd(_collectionIds[index]);
            _adTimes[ _adTimes.length ] = newAdTimeTill;

            // ensure success
            require( success , "Error" );
        }

        // emit event
        emit OnAdTimesExtendedEvent( _collectionIds, _adTimes );

        return true;
    }

        
    /// @notice Put collection on ad
    /// @dev Put collection on ad
    /// @param _collectionId the collection id
    // ensure eth is passed
    // put on ads
    // emit event
    function putOnAd(uint256 _collectionId) external payable ensureListingExists(_collectionId) returns(bool) {
        require( msg.value > adFee, "No Ad Fee" );

        ( bool success, uint256 newAdTimeTill ) = _putOnAd(_collectionId);

        // ensure success
        require( success , "Error" );

        // emit event
        emit OnAdTimeExtendedEvent(_collectionId, newAdTimeTill);

        return true;
    }

        
    /// @notice Put collection on ad
    /// @dev Put collection on ad
    /// @param _collectionId the collection id
    // ensure item exists
    // get the item
    // calculate time now
    function _putOnAd(uint256 _collectionId) internal returns(bool, uint256) {
        // get the collection
        ListedCollection storage _collection = listings[_collectionId];

        // calculate time now
        uint256 paidSeconds = _calculateAdTime(msg.value);

        uint256 newAdTimeTill = 0;

        if ( block.timestamp > _collection.onAdTill ) {
            newAdTimeTill = _collection.onAdTill + paidSeconds;
        } else {
            newAdTimeTill = block.timestamp + paidSeconds;
        }

        // set the new ad time
        _collection.onAdTill = newAdTimeTill;

        return (true, newAdTimeTill);
    }





    
    // add withdraw here
    /// @notice Withdraw msg.sender's eth
    /// @dev Withdraw msg.sender's eth
    // check that msg.sender has a balance
    // subtract their balance
    // send balance
    // revert on failure
    function withdraw() external onlyOwner returns(bool) {
        Address.sendValue(payable(msg.sender), address(this).balance);
        return true;
    }

    


    /// @notice Put ad time
    /// @dev Put ad time
    /// @param _value the eth passed
    function _calculateAdTime(uint256 _value) internal view returns(uint256) {
        if ( _value == 0 ) return 0;

        // calculate time now
        return _value / adFee * 3600;
    }
      
}