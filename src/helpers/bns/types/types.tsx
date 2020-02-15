
export enum BnsActionType {             // types of user BNS actions that match use in actions.tsx
  RENEW = 'RENEW',
  ONLY_FORWARDS = 'ONLY_FORWARDS',
  CLAIM_OWNERSHIP = 'CLAIM_OWNERSHIP',
  SEND_OWNERSHIP = 'SEND_OWNERSHIP',
  CHANGE_ADDRESS = 'CHANGE_ADDRESS'
}

export enum BnsBidType {
  BURN = 'BURN',            // ownership bidding in progress taht requires burns
  NULL = 'NULL'             // no bidding in progress
}

export interface I_BNS_Action {
  type: BnsActionType
  info: string
  permissions: Array<any>
  conditions: Array<any>
  execute: () => void
  suggestions?: string | undefined
}

export interface I_BNS_Auto_Action {
  info: string
  conditions: Array<any>
  execute: () => void
}

export interface I_Action_Choice {
  type: BnsActionType
  info: string
  special: Array<any>
  actionContent: string
}

// (TODO): this might need further generalization and simplification
// this is checked to know what user options are
export interface I_Checked_Guidance {
  type: BnsActionType                   // pass each action type to user attempting to create tx
  info: string                          // describe each action type
  isUsable: boolean                     // summarize if it meets all permissions for user to do
  suggestions?: string                  // the optional suggestion of I_BNS_Action - string instructions
                                        // 'GET_(easy to read description)_(optional storage in embed string)'
                                        // 'WARNING_' is used to warn about allowed actions user probably shouldn't do
                                        //    like waste coins on editing forwarding states on domains that aren't theirs
  permissionList: [                     // every permission checked for this action>
    {
      isAllowed: boolean                // if permission passed check
      info: string                      // description of permission
    }
  ]

  special: Array<{                      // suggestion/guidance array from ea condition AND permission,
                                        // new special array item is only added if .special object of I_Condition is found in any of them
    info: string                        // info is description string of each I_Condition condition AND permission
    rules: {                            // rules are the guidance from each condition or permission
      [key: string]: string | number    // rules come as key value pair
    }
  }>
  actionContent: string                 // holds a string if it needs to be added to embedded string for action to work.
                                        // is derived from user input via a form based on suggestion string with 'GET_' start
}

export interface I_BnsState {
  domain: I_Domain
  chain?: {
    parsedHeight: number                // parsed height for derivation
    currentHeight: number               // real world block height (for final update)
  }
}

export interface I_Domain {             // notification info for this domain name
  domainName: string                    // domain name
  notificationAddress: string           // p2wsh address for this domain name (alias + extension)
  txHistory: Array<I_TX>                // array of all tx for this address (old addressHistory)
  derivedUtxoList: Array<I_UTXO>        // derived utxo set from tx history parse
  utxoList: Array<I_UTXO>               // array of all real time utxo at address
  users: {                              // keeps track of interacting users / source addresses
                                        // with addresses as keys
    [address: string]: I_User
  }
  currentOwner: string                  // points to a source address or blank string

  bidding: {                            // bidding
    startHeight: number                 // auction/challenge start height
    endHeight: number                   // " end height
    type: BnsBidType                    // type of bidding - e.g. BURN / NULL
    bids: Array<I_Bid>                  // array of bids
  }

  ownersHistory: Array<I_User>          // owner history log
}

export interface I_Bid {
  height: number                        // height the bid was confirmed
  timestamp: number                     // timestamp when bid was confirmed
  address: string                       // address doing the bidding
  value: number                         // amount bid
  valueLeftToRefund: number             // amount of bid left to refund
  blockHash: string                     // block hash of block where tx was confirmed
}

export interface I_User {
  address:      string                  // address in control
  forwards:     Array<I_Forward>        // for forwards later
  burnAmount:   number                  // burned to get ownership
  winHeight:    number                  // blockheight winning bid
  winTimestamp: number                  // winHeight in block's timestamp
  nonce:        number                  // for counting previous notification
                                        // height from this address, no matter good/bad/type
  updateHeight: number                  // the height of most current parsed update, created
                                        // after nonce height & therefore using it
}

  // each forward object has the following data
export interface I_Forward {
  network: string
  address: string
  updateHeight: number
  updateTimestamp: number
}

export interface I_TX {
  txid: string
  version: number
  locktime: number
  size: number
  weight: number
  fee: number
  vin: Array <{
    txid: string
    vout: number
    prevout: {
      scriptpubkey: string
      scriptpubkey_asm: string
      scriptpubkey_type: string
      scriptpubkey_address: string
    }
    scriptsig: string
    scriptsig_asm: string
    witness: {
      [key: number]: string
    }
    is_coinbase: boolean
    sequence: number
  }>
  vout: Array <{
    scriptpubkey: string
    scriptpubkey_asm: string
    scriptpubkey_type: string
    scriptpubkey_address: string // op return case?
    value: number
  }>
  status: {
    confirmed: boolean      // unconfirmed case?
    block_height: number
    block_hash: string
    block_time: number
  }
}

export interface I_UTXO {
  txid: string
  vout: number
  status: {
    confirmed: boolean
    block_height: number
    block_hash: string
    block_time: number
  }
  value: number
  hex?: string
  from_scriptpubkey_address?: string
}

export interface I_Condition {
  info: string
  status: () => boolean
  special?: { [key: string]: string | number }
}