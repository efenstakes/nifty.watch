import { BigInt, Address, log } from "@graphprotocol/graph-ts"
import {
  NFTCollection,
  OnNewListingEvent,
  OnListingChangeEvent,
  OnListingMetadataChangeEvent,

  OnListingStatusChangeEvent,
  OnAdTimeExtendedEvent,
  OnAdTimesExtendedEvent,
  OwnershipTransferred
} from "../generated/NFTCollection/NFTCollection"
import { Wallet, Collection, Stats } from "../generated/schema"




// create the collection
export function handleOnNewCollectionEvent(event: OnNewListingEvent): void {
  // load the contract to get read the new listing
  let contract = NFTCollection.bind(event.address)
  let contractListing = contract.listings(event.params.marketID)
  log.info("contractListing ", [ contractListing.value6.toString() ])


  // Entities can be loaded from the store using a string ID; this ID
  // needs to be unique across all entities of the same type
  let listing = Collection.load(contractListing.value0.toString())

  // Entities only exist after they have been saved to the store;
  // `null` checks allow to create entities on demand
  if ( !listing ) {
    listing = new Collection(contractListing.value0.toString())
  }

  // log.info("event.params.lister.toHexString() ", [ event.params.lister.toHexString() ]);
  // log.info("event.params.lister.toHex() ", [ event.params.lister.toHex() ]);
  // log.info("event.params.lister.toString() ", [ event.params.lister.toString() ]);

  // get the stats
  let stats = Stats.load("1")

  if( !stats ) {
    stats = new Stats("1")
    stats = newStats(stats)
  }

  // listing owner
  let lister = Wallet.load(event.transaction.from.toHexString());

  // create wallet if one is not found
  if ( !lister ) {
    lister = new Wallet(event.transaction.from.toHexString())
    lister.address = event.transaction.from
    lister = newWallet(lister)
    lister.save()
  }
  
  // add their total listed
  lister.totalCollectionsListed += 1

  
  // set stats data
  stats.totalCollections = contract.totalListings()
  stats.adFee = contract.adFee()
  stats.lastUpdateTime = event.block.timestamp.plus(event.logIndex) // Date.now().toString()


  // set properties
  listing.marketID = event.params.marketID

  listing.lister = event.transaction.from.toHexString()
  
  listing.name = event.params.name
  listing.bgImage = event.params.avatars[0]
  listing.image = event.params.avatars[1]

  listing.address = contractListing.value0

  listing.mintingOn = contractListing.value4
  listing.goingLiveOn = contractListing.value3
  listing.onAdTill = BigInt.fromI32(0)
  
  listing.totalNfts = contractListing.value5.toI32()
  
  listing.status = contractListing.value6 === 0 ? "LISTED" : "DELISTED"
  listing.is1155 = contractListing.value7
  listing.type = contractListing.value7 ? "ERC1155" : "ERC721"
  
  listing.addedOn = event.block.timestamp.plus(event.logIndex) // Date.now() as i32

  // set socials  
  listing.website = event.params.socials.length > 0 ? event.params.socials[0] : "" 
  listing.mintingWebsite = event.params.socials.length > 1 ? event.params.socials[1] : event.params.socials[0] 
  listing.twitter = event.params.socials.length > 2 ? event.params.socials[2] : "" 
  listing.discord = event.params.socials.length > 3 ? event.params.socials[3] : "" 
  listing.linkedIn = event.params.socials.length > 4 ? event.params.socials[3] : "" 
  listing.socials = event.params.socials


  // Entities can be written to the store with `.save()`
  stats.save()
  lister.save()
  listing.save()
}



export function handleOnCollectionChangeEvent(event: OnListingChangeEvent): void {
  // load the contract to get read the new listing
  let contract = NFTCollection.bind(event.address)
  let contractListing = contract.listings(event.params.marketID)
  log.info("contractListing ", [ contractListing.value6.toString() ])


  // Entities can be loaded from the store using a string ID; this ID
  // needs to be unique across all entities of the same type
  let listing = Collection.load(contractListing.value0.toString())

  // Entities only exist after they have been saved to the store;
  // `null` checks allow to create entities on demand
  if ( !listing ) {
    return
  }


  // get the stats
  let stats = Stats.load("1")

  if( !stats ) {
    stats = new Stats("1")
    stats = newStats(stats)
  }

  
  // set stats data
  stats.totalCollections = contract.totalListings()
  stats.adFee = contract.adFee()
  stats.lastUpdateTime = event.block.timestamp.plus(event.logIndex) // Date.now().toString()

  // get the listing
  let adddedContract = contract.listings(event.params.marketID)
 
  // set properties
  listing.marketID = event.params.marketID
  listing.mintingOn = adddedContract.value4
  listing.goingLiveOn = adddedContract.value3
  listing.totalNfts = adddedContract.value5.toI32()
  listing.is1155 = event.params.is1155
  listing.type = event.params.is1155 ? "ERC1155" : "ERC721"


  // save
  stats.save()
  listing.save()
}

export function handleOnCollectionMetadataChangeEvent(event: OnListingMetadataChangeEvent): void {
    // load the contract to get read the new listing
    let contract = NFTCollection.bind(event.address)
    let contractListing = contract.listings(event.params.marketID)
    log.info("contractListing ", [ contractListing.value6.toString() ])
  
    
    // Entities can be loaded from the store using a string ID; this ID
    // needs to be unique across all entities of the same type
    let listing = Collection.load(contractListing.value0.toString())
  
    // Entities only exist after they have been saved to the store;
    // `null` checks allow to create entities on demand
    if ( !listing ) {
      return
    }
  
  
    // get the stats
    let stats = Stats.load("1")
  
    if( !stats ) {
      stats = new Stats("1")
      stats = newStats(stats)
    }
  
    
    // set stats data
    stats.totalCollections = contract.totalListings()
    stats.adFee = contract.adFee()
    stats.lastUpdateTime = event.block.timestamp.plus(event.logIndex) // Date.now().toString()
  
   
    // set properties
    listing.name = event.params.name
    listing.bgImage = event.params.avatars[0]
    listing.image = event.params.avatars[1]
    listing.marketID = event.params.marketID
    listing.tags = event.params.tags
    
  
    // set socials  
    if( event.params.socials.length > 0 ) {
      listing.website = event.params.socials.length > 0 ? event.params.socials[0] : listing.website
      listing.mintingWebsite = event.params.socials.length > 1 ? event.params.socials[1] : listing.website
      listing.twitter = event.params.socials.length > 2 ? event.params.socials[2] : listing.twitter
      listing.discord = event.params.socials.length > 3 ? event.params.socials[3] : listing.discord
      listing.linkedIn = event.params.socials.length > 4 ? event.params.socials[3] : listing.linkedIn
      listing.socials = event.params.socials
    }
  
    // save
    stats.save()
    listing.save()
}


function handleOnCollectionStatusChangeEvent(event: OnListingStatusChangeEvent): void {
  // load the contract to get read the new listing
  let contract = NFTCollection.bind(event.address)
  let contractListing = contract.listings(event.params.marketID)
  log.info("contractListing ", [ contractListing.value6.toString() ])

  
  let listing = Collection.load(contractListing.value0.toString())
  
  // Entities only exist after they have been saved to the store;
  // `null` checks allow to create entities on demand
  if ( !listing ) {
    return
  }


  // get the stats
  let stats = Stats.load("1")

  if( !stats ) {
    stats = new Stats("1")
    stats = newStats(stats)
  }

  
  // set stats data
  stats.totalCollections = contract.totalListings()
  stats.adFee = contract.adFee()
  stats.lastUpdateTime = event.block.timestamp.plus(event.logIndex) // Date.now().toString()
 
  // set properties
  listing.marketID = event.params.marketID
  listing.status = event.params.status == 0 ? "LISTED" : "DELISTED"

  // save
  stats.save()
  listing.save()
}


export function handleOnCollectionAdTimeExtendEvent(event: OnAdTimeExtendedEvent): void {
  // load the contract to get read the new listing
  let contract = NFTCollection.bind(event.address)
  let contractListing = contract.listings(event.params.marketID)
  log.info("contractListing ", [ contractListing.value6.toString() ])

  
  let listing = Collection.load(contractListing.value0.toString())
  
  // Entities only exist after they have been saved to the store;
  // `null` checks allow to create entities on demand
  if ( !listing ) {
    return
  }


  // get the stats
  let stats = Stats.load("1")

  if( !stats ) {
    stats = new Stats("1")
    stats = newStats(stats)
  }
  

  // set stats data
  stats.totalCollections = contract.totalListings()
  stats.adFee = contract.adFee()
  stats.lastUpdateTime = event.block.timestamp.plus(event.logIndex) // Date.now().toString()
 
  // set properties
  listing.onAdTill = event.params.newAdTimeTill

  // save
  stats.save()
  listing.save()
}


export function handleOnCollectionsAdTimesExtendEvent(event: OnAdTimesExtendedEvent): void {
  
  // get the stats
  let stats = Stats.load("1")

  if( !stats ) {
    stats = new Stats("1")
    stats = newStats(stats)
  }

  // load the contract to get read the new listing
  let contract = NFTCollection.bind(event.address)
  
  
  // set stats data
  stats.totalCollections = contract.totalListings()
  stats.adFee = contract.adFee()
  stats.lastUpdateTime = event.block.timestamp.plus(event.logIndex) // Date.now().toString()

  // save
  stats.save()

 
  // update all collections
  for (let index = 0; index < event.params.marketIDs.length; index++) {
    const marketID = event.params.marketIDs[index]

    // load the contract to get read the new listing
    let contract = NFTCollection.bind(event.address)
    let contractListing = contract.listings( new BigInt(marketID) )
    log.info("contractListing ", [ contractListing.value6.toString() ])

  
    let collection = Collection.load(marketID.toString())

    if( !collection ) return

    collection.onAdTill = event.params.newAdTimesTill[index]

    // save
    collection.save()
  }
  // event.params.marketIDs.forEach((marketID: number, index: number)=> {

  //   let collection = Collection.load(marketID.toString())

  //   if( !collection ) return

  //   collection.onAdTill = event.params.newAdTimesTill[index]

  //   // save
  //   collection.save()
  // })
}


export function handleOwnershipTransferred(event: OwnershipTransferred): void {}




function updateStats(contract: NFTCollection, stats: Stats): Stats {
  stats.totalNFTs = contract.totalListings()
  stats.adFee = contract.adFee()

  return stats
}

function newWallet(wallet: Wallet): Wallet {
  wallet.totaNFTsOwned = 0
  wallet.ethInvested = new BigInt(0)

  return wallet
}

function newStats(stats: Stats): Stats {
  stats.totalNFTs = new BigInt(0)
  stats.totalSales = 0
  stats.adFee = new BigInt(0)
  stats.adFee = new BigInt(0)

  return stats
}


function newCollection(collection: Collection): Collection {
  collection.totalNfts = 0
  collection.totalOwners = 0
  collection.totalSales = 0
  collection.totalListedNfts = 0
  
  collection.tags = []

  return collection
}

