import { useEffect } from 'react'
import { Link } from 'react-router-dom'

import CircuitBackground from '@/components/CircuitBackground'
import Navigation from '@/components/Navigation'

const NotFound = () => {
  useEffect(() => {}, [])

  return (
    <div className='min-h-screen bg-linear-to-br from-navy-800 via-navy-900 to-navy-950 relative overflow-hidden'>
      <CircuitBackground />
      <Navigation />

      <div className='relative z-10 min-h-screen flex items-center justify-center'>
        <div className='container mx-auto px-6 md:px-12 lg:px-20 py-20'>
          <div className='max-w-2xl mx-auto text-center space-y-6'>
            <h1 className='text-8xl md:text-9xl font-bold text-cyan-400'>404</h1>
            <p className='text-2xl md:text-3xl text-white/90 font-medium'>Oops! Page not found</p>
            <p className='text-white/70 text-lg'>
              The page you're looking for doesn't exist or has been moved.
            </p>
            <Link
              to='/'
              className='inline-block px-8 py-3 bg-transparent border-2 border-cyan-400/60 hover:border-cyan-400 text-white/90 hover:text-white rounded-md transition-all duration-300 hover:shadow-lg hover:shadow-cyan-500/20 uppercase text-sm tracking-wider font-medium'
            >
              Return to Home
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}

export default NotFound
