import { BigInt, Address, log } from "@graphprotocol/graph-ts"
import {
  ERC721,
  Transfer,
  Approval,
  ApprovalForAll,
  Transfer__Params
} from "../generated/ERC721/ERC721"
import { Wallet, Collection, Stats, Activity, NFT } from "../generated/schema"





// on transfer
export function handleTransfer(event: Transfer): void {
    const erc721 = ERC721.bind(event.address)

    let stats = Stats.load("1")

    if ( !stats ) {
        stats = newStats()
    }
    stats.lastUpdateTime = event.logIndex.plus(event.block.timestamp)


    // load nft
    let nft = NFT.load(event.params.tokenId.toString().concat(event.address.toString()))
    
    if( !nft ) {
        nft = newNFT(event.params, event.params.tokenId.toString().concat(event.address.toString()))
    }

    nft.collection = event.address.toString()
    nft.tokenId = event.params.tokenId
    nft.approved = null
    nft.owner = event.params.to.toString()
    nft.tokenURI = erc721.tokenURI(event.params.tokenId)

    // load collection
    let collection = Collection.load(event.address.toString())
    if( !collection ) {
        collection = newCollection(event.address.toString())
    }

    collection.totalSales += 1


    // activity
    let activity = new Activity(event.params.tokenId.toString().concat(event.address.toString()))
    activity.timestamp = event.block.timestamp.plus(event.logIndex)
    activity.collection = event.address.toString()
    activity.wallet = event.params.to.toString()
    activity.type = event.address === event.params.from ? "MINTING" : "TRANSFER"


    // save
    stats.save()
    nft.save()
    collection.save()
    activity.save()
}






export function handleApprovalForAll(event: ApprovalForAll): void {

}



function newNFT(params: Transfer__Params, id: string): NFT {
    let nft = new NFT(id)

    nft.totalOwners = new BigInt(0)
    nft.tokenId = params.tokenId

    return nft
}


function newCollection(address: string): Collection {
    let collection = new Collection(address)

    collection.totalNfts = 0
    collection.totalOwners = 0
    collection.totalSales = 0
    collection.totalListedNfts = 0
    
    collection.tags = []

    return collection
}


function newStats(): Stats {
    let stats = new Stats('1')

    stats.adFee = new BigInt(0)
    stats.totalSales = 0
    stats.totalNFTs = new BigInt(0)
    stats.totalCollections = new BigInt(0)

    return stats
}