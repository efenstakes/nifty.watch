import { BigInt, Address, log } from "@graphprotocol/graph-ts"
import {
  ERC1155,
  TransferSingle,
  TransferBatch,
  ApprovalForAll,
  TransferSingle__Params,
} from "../generated/ERC1155/ERC1155"
import { Wallet, Collection, Stats, Activity, NFT } from "../generated/schema"





// on transfer
export function handleTransferSingle(event: TransferSingle): void {
    const erc1155 = ERC1155.bind(event.address)

    let stats = Stats.load("1")

    if ( !stats ) {
        stats = newStats()
    }
    stats.lastUpdateTime = event.logIndex.plus(event.block.timestamp)


    // load nft
    let nft = NFT.load(event.params.id.toString().concat(event.address.toString()))
    
    if( !nft ) {
        nft = newNFT(
            event.params.id.toString().concat(event.address.toString()),
            event.params.id
        )
    }

    nft.collection = event.address.toString()
    nft.tokenId = event.params.id
    nft.approved = null
    nft.owner = event.params.to.toString()
    nft.tokenURI = erc1155.uri(event.params.id)

    
    // load collection
    let collection = Collection.load(event.address.toString())
    if( !collection ) {
        collection = newCollection(event.address.toString())
    }
    collection.totalSales += 1


    // buyer
    let buyer = Wallet.load(event.params.to.toString())

    if( !buyer ) {
        buyer = newWallet(event.params.to.toString())
    }
    buyer.totaNFTsOwned += 1

    
    // seller
    let seller = Wallet.load(event.params.from.toString())

    if( !seller ) {
        seller = newWallet(event.params.from.toString())
    }
    seller.totaNFTsSold += 1



    // activity
    let activity = new Activity(event.params.id.toString().concat(event.block.timestamp.toString()))
    activity.timestamp = event.block.timestamp.plus(event.logIndex)
    activity.collection = event.address.toString()
    activity.wallet = event.params.to.toString()
    activity.type = event.address === event.params.from ? "MINTING" : "TRANSFER"


    // save
    stats.save()
    nft.save()
    collection.save()
    activity.save()

    buyer.save()
    seller.save()
}





// on transfer
export function handleTransferBatch(event: TransferBatch): void {
    const erc1155 = ERC1155.bind(event.address)

    let stats = Stats.load("1")

    if ( !stats ) {
        stats = newStats()
    }
    stats.lastUpdateTime = event.logIndex.plus(event.block.timestamp)


    for (let index = 0; index < event.params.ids.length; index++) {
        const tokenId = event.params.ids[index]
        const from = event.params.from[index]
        const to = event.params.to[index]
        const operator = event.params.operator[index]
        

        // load nft
        let nft = NFT.load(tokenId.toString().concat(event.address.toString()))
        
        if( !nft ) {
            nft = newNFT(
                tokenId.toString().concat(event.address.toString()),
                tokenId
            )
        }

        nft.collection = event.address.toString()
        nft.tokenId = tokenId
        nft.approved = null
        nft.owner = event.params.to.toString()
        nft.tokenURI = erc1155.uri(tokenId)

        
        // load collection
        let collection = Collection.load(event.address.toString())
        if( !collection ) {
            collection = newCollection(event.address.toString())
        }
        collection.totalSales += 1


        // buyer
        let buyer = Wallet.load(to.toString())

        if( !buyer ) {
            buyer = newWallet(to.toString())
        }
        buyer.totaNFTsOwned += 1

        
        // seller
        let seller = Wallet.load(from.toString())

        if( !seller ) {
            seller = newWallet(from.toString())
        }
        seller.totaNFTsSold += 1



        // activity
        let activity = new Activity(tokenId.toString().concat(event.block.timestamp.toString()))
        activity.timestamp = event.block.timestamp.plus(event.logIndex)
        activity.collection = event.address.toString()
        activity.wallet = event.params.to.toString()
        activity.type = event.address.toString() === operator.toString() ? "MINTING" : "TRANSFER"


        // save
        stats.save()
        nft.save()
        collection.save()
        activity.save()

        buyer.save()
        seller.save()
        }

    // save
    stats.save()
}

export function handleApprovalForAll(event: ApprovalForAll): void {

}




function newWallet(id: string): Wallet {
    let wallet = new Wallet(id)

    wallet.totaNFTsOwned = 0
    wallet.totaNFTsSold = 0
    wallet.totalApprovalsTo = 0
    wallet.totalApprovalsFrom = 0
    wallet.totalCollectionsListed = 0
    wallet.ethInvested = new BigInt(0)

    return wallet
}

function newNFT(id: string, tokenId: BigInt): NFT {
    let nft = new NFT(id.toString())

    nft.totalOwners = new BigInt(0)
    nft.tokenId = tokenId

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