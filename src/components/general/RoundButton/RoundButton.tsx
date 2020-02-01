import React from 'react'
import styles from './RoundButton.module.css'

/**
 * Standard button for this app.
 *
 * Pass the following props to customize it.
 *
 * next='true' to add next arrow at right.
 *
 * back='true' to add back arrow on left.
 *
 * show='true' to display element vs show='false' to set display to none (dom still exists).
 *
 * sizebutton='2.9' to make the button size 2.9x standard var(--s) size used (defined in global global.css).
 *
 * colorbutton='var(--colorBitcoinOrange)' to customize color.
 *
 * colorbuttonText='var(--colorButtonText)' to customize text color.
 *
 * Defaults (vars defined in global global.css):
 *
 * sizebutton = 2.5. ( means font size calc(2.5/2.9 * var(--s)) )
 *
 * colorbutton = var(--colorBitcoinOrange).
 *
 * colorbuttontext = var(--colorButtonText).
 */
export const RoundButton = (props:any): JSX.Element => {
  return (
    <div
      // variables defined by string will be available to button & its children for scope
      style={{
        display: (
          (props?.show === 'false') ? 'none' : 'inline-block'
        ) as React.CSSProperties,
        '--colorThisButton': (
          props.colorbutton ? props.colorbutton : `var(--colorBitcoinOrange)`
        )  as React.CSSProperties,
        '--colorThisButtonText': (
          props.colorbuttontext ? props.colorbuttontext : `var(--colorButtonText)`
        ) as React.CSSProperties,
        '--sizeButton': (
          props.sizebutton
          // Button was designed at 2.9 * var(--s) scale font so
          // this just lets user redefine font & everything else proportionally
            ? `calc(${props.sizebutton}/2.9 * var(--s))`
            : `calc(2.5/2.9 * var(--s))`
        ) as React.CSSProperties
      }}
      className={ styles.roundButtonWrap }
      {...props}
    >
      <div
        className={ [
          styles.roundButton,
          props.back ? styles.backArrow : undefined,
          props.next ? styles.nextArrow : undefined,
        ].join(' ') }
      >
        { props.children }
      </div>
    </div>
  )
}