import React from 'react'
import { useContext } from 'react'
import { AppContent } from '../context/AppContext'

const Header = () => {

  const {userData} = useContext(AppContent)

  return (
    <div className='flex flex-col items-center mt-20 px-4 text-center text-gray-800'>
      <h1 className='flex items-center gap-2 text-xl sm:text-3xl font-medium mb-2'>Hey {userData ? userData.name : 'Developer' }! </h1>
      <h2 className='text-3xl sm:text-5xl font-semibol mb-4'>Welcome to our app</h2>
      <button className='border border-gray-500 rounded-full px-8 py-2.5 hover:bg-gray-100 transition-all'>Get started</button>
    </div>
  )
}

export default Header
