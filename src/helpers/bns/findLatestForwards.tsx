import { I_Forward } from './types/'
/**
 * Returns array with only latest forwards from array of all forwards.
 */
export const findLatestForwards = (forwards: Array<I_Forward>): Array<I_Forward> => {
  // simplest would be to go through object where keys of cloned network would overwrite
  // sort first for simplicity
  const sortedForwards = [...forwards].sort((prev, next) => {
    // sorts by index proportional to block height and time
    const prevHeight = prev.updateHeight
    const nextHeight = next.updateHeight
    return prevHeight - nextHeight
  })
  // now just overwrite values for same networks in order of sorted array
  const currentNetworks: {[key: string]: I_Forward} = {}
  sortedForwards.forEach(eaForward => {
    currentNetworks[eaForward.network] = eaForward
  })
  // return just array of values, networks still part of values as well
  return [...Object.values(currentNetworks)]
}
