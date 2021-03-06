import { I_State, Dispatch } from '../../interfaces'
import sanitize from '../../helpers/sanitize'
import { ActionTypes } from './../../interfaces'
const { TYPING } = ActionTypes

/**
 * Cleans up the entered string including removing next line characters
 */
export const changeAliasAction = async (
  state: I_State,
  dispatch: Dispatch,
  value: any
) => {
  // clean up the string
  const newString = value
  const sanitizedString = sanitize(newString, 'bns')

  return dispatch({
    type: TYPING,
    payload: sanitizedString
  })
}
