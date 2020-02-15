import {
  I_Domain,
  I_TX,
  I_UTXO,
  I_Action_Choice
} from './../helpers/bns/types/'

/**
 * All the interfaces & enums
 */

export * from './../helpers/bns/types/'

// for global state "Store" action creators
export enum ActionTypes {
  STORE_SEARCH_RESULTS = 'STORE_SEARCH_RESULTS',
  STORE_SEARCH_RESULTS_FAIL = 'STORE_SEARCH_RESULTS_FAIL',
  TYPING = 'TYPING',
  NEW_WALLET = 'NEW_WALLET',
  CHANGE_PAGE_INFO = 'CHANGE_PAGE_INFO',
  UPDATE_WALLET = 'UPDATE_WALLET',
  UPDATE_DOMAIN = 'UPDATE_DOMAIN',
  ACTION_FAIL = 'ACTION_FAIL',
  LOAD_STATE = 'LOAD_STATE',
  CHOICES_BNS_ACTION = 'CHOICES_BNS_ACTION'
}

// for global state reducer
export type Dispatch = React.Dispatch<I_Action>

// for global state "Store" actions
export interface I_Action {
  type: ActionTypes
  payload: any
}

export interface I_State {
  network: string
  alias: string
  extension: string
  domain: I_Domain
  wallet: {
    address: string
    mnemonic: string
    WIF: string
    txHistory:  Array<I_TX>
    utxoList: Array<I_UTXO>
  }
  chain: {
    height: number
  }
  choices: {
    action: I_Action_Choice | {}
    feeRate: number
    txHex: string
    embedString: string
  }
  pageInfo: {
    current: number
    checkedDomain: boolean
    checkedWallet: boolean
    checkedLightSearch: boolean
  }
  lastTimeStamp: number
}
