import { IUser, IBnsState } from './types/'

// Initializing values

export const newState: IBnsState = {
  domain: {                                     // notification info for this domain name
    domainName:                   '',           // domain name
    notificationAddress:          '',           // p2wsh address for this domain name (alias + extension)
    txHistory:                    [],           // array of all tx for this address (old addressHistory)
    utxoList:                     [],           // array of all current utxo for this address
    users:                        {},           // keeps track of interacting users / source addresses with addresses as keys
    currentOwner:                 '',           // points to a source address or blank string
    bidding:                      {},           // bidding
    ownersHistory:                []            // owner history log
  },
  chain: {
    parsedHeight:                 0,            // parsed height for derivation
    currentHeight:                0             // real world block height
  }
}

// values to initialize users with
export const newUser: IUser = {
  address:        '',           // address in control
  forwards:       [],           // for forwards later
  burnAmount:     0,            // burned to get ownership
  winHeight:      0,            // blockheight winning bid
  winTimestamp:   0,            // winHeight in block's timestamp
  nonce:          0,            // for counting previous notification height from this address, no matter good/bad/type
  updateHeight:   0             // the height of most current parsed update, created after nonce height & therefore using it
}