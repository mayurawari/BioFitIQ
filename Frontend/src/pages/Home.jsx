import { Footer } from '@/components/Footer'
import { Navbar } from '@/components/Navbar'
import React from 'react'
import { MidSection } from './MidSection'

export const Home = () => {
  return (
    <>
    <div className='w-full justify-center items-center'>
    <Navbar/>
    <MidSection/>
    <Footer/>
    </div>
    </>
  )
}
