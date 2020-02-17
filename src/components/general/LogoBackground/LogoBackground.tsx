import React from 'react'
import { Logo } from './../Logo'
import styles from './LogoBackground.module.css'

/**
 * Turn logo into background.
 */
export const LogoBackground = (props: any) => {
  return (
    <div className={ styles.wrapper }>
      <Logo
        className={ styles.logo }
      />
    </div>
  )
}