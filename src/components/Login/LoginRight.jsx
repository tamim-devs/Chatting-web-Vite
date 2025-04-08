import React from 'react'
import Lock from '../../assets/lock.gif'
const LoginRight = () => {
  return (
    <div className='h-screen w-[40%]  bg-blue-400 flex justify-center items-center'>
          <picture>
            <img src={Lock} alt="Lock" className='object-cover' />
          </picture>
        </div>
  )
}

export default LoginRight