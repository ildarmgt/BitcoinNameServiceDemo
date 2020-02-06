import React from 'react'
import { Store } from '../../../store'
import { RoundButton } from '../../general/RoundButton'
import styles from './P6Broadcast.module.css'
import { changePageInfoAction } from '../../../store/actions'
import { txPush } from './../../../api/blockstream'
/**
 * Broadcast tx page.
 * Fee selection.
 * Transaction summary/status. *
 */
export const P6Broadcast = () => {
  // global state
  const { state, dispatch } = React.useContext(Store)

  return (
    <div className={ styles.wrapper }>
      <div className={ styles.title }>
        Decide fee rate to broadcast
      </div>
      <div className={ styles.feeSelection }>
        <div className={ styles.Rate }>
          Fee 1.1 sat/vByte
        </div>
        <div className={ styles.usdAPI }>
          get USD estimates
        </div>
        <div className={ styles.feeAPI }>
          get fee estimates
        </div>
      </div>
      <div className={ styles.txSummary }>
        tx stats or tx fail
      </div>
      <div className={ styles.txHex }>
        Tx hex: { state.choices.txHex }
      </div>
      <div className={ styles.buttonWrapper }>
        <RoundButton
          onClick={ () => {
            console.log('tx hex', state.choices.txHex)
            txPush(state.choices.txHex, state.network)
          } }
        >
          Broadcast
        </RoundButton>
        <RoundButton
          onClick={ () => changePageInfoAction(state, dispatch, 5)
          }
        >
          Back
        </RoundButton>
      </div>

    </div>
  )
}