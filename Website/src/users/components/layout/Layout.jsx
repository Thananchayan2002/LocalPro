import React from 'react'
import { Header } from './Header'
import { Footer } from './Footer'
import { Outlet } from 'react-router-dom'

export const Layout = () => {
  return (
    <div className='overflow-x-hidden'>
        <Header />
        <main className="relative z-1 min-h-screen">
            <Outlet />
        </main>
        <footer>
            <Footer /> 
        </footer>
    </div>
  )
}
