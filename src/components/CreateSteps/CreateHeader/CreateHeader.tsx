import React, { useEffect, useState } from 'react'
import styles from './CreateHeader.module.css'
import { Store } from './../../../store/'



// restore backup or create new
export const CreateHeader = () => {
  const { state } = React.useContext(Store) // global state

  // Make sure entire alias is always visible on top through
  // resizing based on letter count.
  //
  // get window width in component instance state 'width'
  // so can resize alias based on char count
  const [ width, setWidth ] = useState(window.innerWidth)
  useEffect(() => {
    const resize = () => { setWidth(window.innerWidth) }
    window.addEventListener('resize', resize);
    return () => window.removeEventListener('resize', resize);
  }, [])
  const domainName = state.alias + state.extension
  // enforces max size to font size so 1 letter alias has same font as 19 letter alias
  const fontScale = Math.min(
      Math.floor(1.3 * width / domainName.length),
      Math.floor(1.3 * width / 20)
  )

  const barHeight = { height: (0.12 * width + 0.4 * fontScale).toString() + 'px' }
  const aliasMarginTop = { marginTop: (0.03 * width - 0.3 * fontScale).toString() + 'px' }
  const aliasFontSize = { fontSize: fontScale.toString() + 'px' }

  return (
    <>
      <div
        className={ styles.cutOverflow }
        style={ barHeight }
      >
        <div
          className={ styles.bar }
          style={ barHeight }
        />
      </div>
      <div
        className={ styles.wrapper }
        style={ aliasMarginTop }
      >
        <span
          className={ styles.alias }
          style={ aliasFontSize }
        >{ state.alias }</span>
        <span
          className={ styles.ext }
          style={ aliasFontSize }
        >{ state.extension }</span>
      </div>
      <div className={ styles.spacer } />
    </>
  )
}
