import React from 'react'
import { HomeContent } from './../components/HomeContent'

export const Home = (props: any): JSX.Element => {
  return (
    <>
      <HomeContent { ...props } />
    </>
  )
}
