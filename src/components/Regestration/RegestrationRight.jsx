import React from 'react'
import Lock from '../../assets/lock.png'
const RegestrationRight = () => {
  return (
    <div className="w-full h-screen bg-blue-400 flex justify-center items-center">
      <picture>
        <img src={Lock} alt="Lock" className="object-cover" />
      </picture>
    </div>
  );
}

export default RegestrationRight
