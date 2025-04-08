import React from 'react'
import HomeLeft from '../HomeComponents/HomeLeft/HomeLeft'
import { Outlet } from 'react-router-dom'

const RootLayout = () => {
  return (
    <div className='flex'>
      <HomeLeft/>
      <Outlet/>
    </div>
  )
}

export default RootLayout