import React from 'react'
import LoginLeft from '../components/Login/loginleft'
import LoginRight from '../components/Login/LoginRight'

const Login = () => {
  return (
    <div className='flex items-start'>
      <LoginLeft/>
      <LoginRight/>
    </div>
  )
}

export default Login