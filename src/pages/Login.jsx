import React from 'react'
import LoginRight from '../components/Login/LoginRight'
import LoginLeft from '../components/Login/LoginLeft'
const Login = () => {
  return (
    <div className='flex items-start'>
      <LoginLeft  />
      <LoginRight/>
    </div>
  )
}

export default Login