import { calcP2WSH } from './calcP2WSH'
import { OWNERSHIP_DURATION_BY_BLOCKS, MIN_BURN, MIN_NOTIFY } from './constants'
import { decrypt } from './cryptography'
import { IUser, Iforward, IBnsState } from './types/'

/**
 * Returns ownership and notification information objects.
 * @param   {Array<any>}  notificationsHistory  - array of any tx with notificationsAddress.
 * @param   {string}      domainName            - full domainName to use (e.g. 'satoshi.btc').
 * @param   {number}      currentHeight         - current blockheight of the network chain selected.
 * @param   {string}      networkChoice         - 'testnet' or 'bitcoin' (matches bitcoinjs-lib).
 * @returns {object}                            - { notifications, ownership } information objects.
 */
export const calcOwnership = (
  notificationsHistory: Array<any>,
  domainName: string,
  currentHeight: number,
  networkChoice: string
) => {

  // keep track of bns state in an object for easy passing
  const bns: IBnsState = {
    domain: {                         // notification info for this domain name
      domainName,                     // domain name
      address:          '',           // p2wsh address for this domain name (alias + extension)
      txHistory:        [],           // array of all tx for this address (old addressHistory)
      utxoList:         [],           // array of all current utxo for this address
      sources:          {},           // keeps track of interacting users / source addresses with addresses as keys
      currentOwner:     '',           // points to a source address or blank string
      bidding:          {},           // bidding
      ownersHistory:    []            // owner history log
    },
    chain: {
      parsedHeight:     0,            // parsed height for derivation
      nonce:            0,            // height at prior parsed update, would've been used for nonce
      currentHeight                   // real world block height
    }
  }

  // object to track ownership of domainName through history
  const resetOwner: IUser = {  // values to reset owner when ownership is lost
    address: '',                // address in control
    forwards: [],               // for forwards later
    burnAmount: 0,              // burned to get ownership
    winHeight: 0,               // blockheight winning bid
    winTimestamp: 0,            // winHeight in block's timestamp
    updateHeight: 0             // nonce, for counting last notification height from this address, no matter good/bad/type
  }

  // grab notification address
  bns.domain.address = calcP2WSH(domainName, networkChoice)?.notificationsAddress || ''

  // Sorting history from earliest to latest
  // reversing should speed it up if not complete it
  bns.domain.txHistory = (notificationsHistory
    .slice().reverse()
    .sort((prev, next) => {
      const aBlockHeight = prev.status.block_height
      const bBlockHeight = next.status.block_height
      return aBlockHeight - bBlockHeight
    })
  )

  // Array to track utxo to redeem
  // const utxoToRedeem = []
  // Array to track notification utxo to consume
  // const utxoToConsume = []

  // temporary place for functions before I export them =====================

  const isThereCurrentOwner = (st: IBnsState) => st.domain.currentOwner !== ''

  const getOwnerAddress = (st: IBnsState) => st.domain.currentOwner

  const getOwner = (st: IBnsState) => {
    const ownerAddress = getOwnerAddress(st)
    if (!ownerAddress) return undefined
    return st.domain.sources[ownerAddress]
  }

  const clearOwner = (st: IBnsState) => { st.domain.currentOwner = '' }

  const isOwnerExpired = (st: IBnsState, tx: any) => {
    if (isThereCurrentOwner(st)) { return true }
    const owner = getOwner(st)
    if (!owner) { throw new Error('Owner not found for current owner address') }
    const blocksSinceUpdate = st.chain.parsedHeight - owner.winHeight
    return blocksSinceUpdate > OWNERSHIP_DURATION_BY_BLOCKS
  }

  const getTxHeight = (st: IBnsState) => st.chain.parsedHeight

  const setTxHeight = (st: IBnsState, height: number) => {
    st.chain.nonce = st.chain.parsedHeight  // update nonce to previous height
    st.chain.parsedHeight = height          // update current height
  }

  const getNotificationAddress = (st: IBnsState) => bns.domain.address



  // ===== tx specific functions =====================

  const getTxOutput0BurnValue = (tx: any) => tx.vout[0].value
  const getTxOutput1NotifyValue = (tx: any) => tx.vout[1].value
  const getTxOutput1Address = (tx: any) => tx.vout[1].scriptpubkey_address

  const getTxInput0Address = (tx: any) => tx.vin[0].prevout.scriptpubkey_address


  // ===== rule checks =====

  // Describe:    2 outputs minimum
  // Required:    ALL
  const atLeastTwoOutputs = (tx: any) => tx.vout.length >= 2

  // Describe:    Is [0] output OP_RETURN type
  // Required:    ALL
  const isOpreturnOutput0 = (tx: any) => tx.vout[0].scriptpubkey_asm.split(' ')[0] === 'OP_RETURN'

  // Describe:    Is [1] output this domain's notification address?
  // Required:    ALL
  const isNotify =  (st: IBnsState, tx: any) => getTxOutput1Address(tx) === getNotificationAddress(st)

  // Describe:    At least minimum amount used in notification output? (Dust level is main danger)
  // Required:    ALL
  const didNotifyMin = (tx: any) => getTxOutput1NotifyValue(tx) >= MIN_NOTIFY

  // Describe:    Is sender the current domain owner (input [0], id'ed by address)?
  // Required:    renew lease
  // Irrelevant:  available domain claim, forwarding information updates (warn)
  const isFromCurrentOwner = (st: IBnsState, tx: any) =>  getOwnerAddress(st) === getTxInput0Address(tx)



  // === end of functions ===========


  // history of all owners, initiated
  bns.domain.ownersHistory.push(resetOwner)

  // iterate with blockheights of relevant tx to derive BNS state
  // Each tx blockheight serves as reference time
  bns.domain.txHistory.forEach(tx => {
    try {

      // update current parsed height (i.e. time metric)
      setTxHeight(bns, tx.status.block_height)

      // First, derive if there's still an owner at this new time (block height)
      // Expiration: if OWNERSHIP_DURATION_BY_BLOCKS blocks since ownership update, no owner again
      if (isThereCurrentOwner(bns) && isOwnerExpired(bns, tx)) {
        clearOwner(bns)
        console.log(domainName, getTxHeight(bns), 'ownership expired')
      }

       // ===Computed ownership rules & enforcement ===



      if (!atLeastTwoOutputs) { throw new Error('Not enough outputs') }

      if (!isOpreturnOutput0) { throw new Error('OP_RETURN missing from output index 0') }

      if (!isNotify) { throw new Error('Notification output missing from output index 1') }

      if (!didNotifyMin) { throw new Error('Did not send enough for notify ' + MIN_BURN) }







      // Describe:    At least minimum amount burned?
      // Required:    available domain claim, renew lease
      // Irrelevant:  forwarding information updates
      const didBurnMin = (getTxOutput0BurnValue(tx) >= MIN_BURN)

      // Cannot do anything about ownership if not owner and did not burn
      if (!isFromCurrentOwner && !didBurnMin) { throw new Error('Not owner & did not burn the minimum of ' + MIN_BURN) }

      // BNS_ACTION:  OLD_OWNER_RENEW     - If from current owner & burned past winning minimum, extend ownership.
      const burnedPreviousRateMin = txBurnAmount >= currentOwner.burnAmount
      if (isFromCurrentOwner && burnedPreviousRateMin) {
        currentOwner = {
          address: currentOwner.address,        // unchanged
          forwards: currentOwner.forwards,      // unchanged
          burnAmount: currentOwner.burnAmount,  // unchanged

          // update winning height to extend ownership duration
          winHeight: txBlockHeight,
          winTimestamp: tx.status.block_time,
          updateHeight: 0
        }
        throw new Error(`${ domainName } : ${ txBlockHeight } height: owner extended ownership ${ currentOwner.address }`)
      }

      // BNS_ACTION:  NEW_OWNER_CLAIM     - If no owner & burned minimum, give ownership.
      if (!doesCurrentOwnerExist && didBurnMin) {
        currentOwner = {
          address: tx.vin[0].prevout.scriptpubkey_address,
          forwards: [],
          burnAmount: txBurnAmount,
          winHeight: txBlockHeight,
          winTimestamp: tx.status.block_time,
          updateHeight: 0
        }
        throw new Error(`${ domainName } : ${ txBlockHeight } height: new owner is ${ currentOwner.address }`)
      }
    } catch (e) {
      console.log('tx scanned:', e.message)
    }
    // update ownership history each tx
    ownersHistory.push(currentOwner)
  })

  // Iterate through history one more time to build up forwards for this owner
  // rules are much more relaxed for forwards
  // just has to be from controlling address @ vin[0] and have data in op_return @ vout[0]
  // notification address must have been used for this tx to be in the list so can skip checking
  // Separate pass has convinience of being able to reuse forwards of same controlling address
  // Keep track of last notification tx by owner blockheight (before other checks) for aes nonce
  //
  const collectedForwardsInHistory: (Array<Iforward> | []) = (sortedNotificationsHistory
    .reduce((foundForwardsInHistory = [], tx) => {
      // is tx input #0 from owner's controlling address
      const txOwner = tx.vin[0].prevout.scriptpubkey_address
      const fromOwner = (txOwner === currentOwner.address)
      if (!fromOwner) { return foundForwardsInHistory } // skip tx bc irrelevant

      // If from owner, update blockheight as future nonce.
      // The only requirement for nonce update for this controlling address is for input [0] to be from this address.
      const nonce = currentOwner.updateHeight.toString()        // prev notification height by this owner or 0
      const txBlockHeight = tx.status.block_height
      currentOwner.updateHeight = txBlockHeight

      const isOpreturn = (tx.vout[0].scriptpubkey_asm.split(' ')[0] === 'OP_RETURN')
      if (!isOpreturn) { return foundForwardsInHistory } // skip tx bc didn't have op_return so irrelevant

      // remove 'OP_RETURN '
      const embeddedDataHex = tx.vout[0].scriptpubkey_asm.split(' ').slice(2).join('')
      const embeddedDataBuffer = Buffer.from(embeddedDataHex, 'hex')
      // decrypt
      const decryptionKey = domainName + currentOwner.address + nonce
      const embeddedDataUtf8 = decrypt(embeddedDataBuffer, decryptionKey)
      // console.log('found asm', tx.vout[0].scriptpubkey_asm)
      // console.log('embeddedDataHex:', embeddedDataHex)
      console.log('found embedded data:', embeddedDataUtf8)

      // need to form array of forwards out of each tx (could be more than 1 defined)
      // and then combine these forwards across all tx for this owner
      const collectedForwardsInThisTx = (embeddedDataUtf8
        // data separated by utf8 spaces
        .split(' ')
        .reduce((foundForwardsInThisTx: (Array<Iforward> | []), networkPiece, index, embeddedTxDataArray) => {
          // only need to do on every 2nd data piece
          // for now only for cases where there is network id following each value
          const lastIndex = embeddedTxDataArray.length - 1 // largest array index I can call
          if ((index % 2 === 0) && (index < lastIndex)) {
            // every 2nd & safe index
            const forwardingAddressPiece = embeddedTxDataArray[index + 1] // forwarding address
            console.log('added', networkPiece, ':', forwardingAddressPiece)
            const thisForward = {
              network: networkPiece,
              address: forwardingAddressPiece,
              updateHeight: txBlockHeight,
              updateTimestamp: tx.status.block_time
            }
            return [
              ...foundForwardsInThisTx,
              thisForward
            ]
          } else {
            return foundForwardsInThisTx // skip if not a pair to end looping
          }
        }, [])
      )
      // adds collected network:forwards pairs from this tx to overall list of them
      return [
        ...foundForwardsInHistory,
        ...collectedForwardsInThisTx
      ]
    }, undefined)
  )

  // update forwards for owner object
  currentOwner.forwards = collectedForwardsInHistory

  // Check if last known ownership timed out. if so reset.
  const blocksSinceUpdate = currentHeight - currentOwner.winHeight
  const isExpired = blocksSinceUpdate > OWNERSHIP_DURATION_BY_BLOCKS
  if (!!currentOwner.address && isExpired) {
    ownersHistory.push(currentOwner) // update ownership history final time
    currentOwner = { ...resetOwner } // reset current owner
    console.log(domainName, currentHeight, 'current ownership expired')
  }

  // returns notification info and ownership info that includes current owners forwards
  return {
    notifications: {
      address: notificationsAddress,
      txHistory: sortedNotificationsHistory,
      utxoList: []
    },
    ownership: {
      current: currentOwner,
      topBidder: {}, // (TODO)
      history: ownersHistory
    }
  }
}
