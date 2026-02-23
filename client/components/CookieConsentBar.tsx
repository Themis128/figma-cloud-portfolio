import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'

const COOKIE_KEY = 'portfolio_cookie_consent'

export function CookieConsentBar() {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const consent = localStorage.getItem(COOKIE_KEY)
    if (!consent) setVisible(true)
  }, [])

  const handleAccept = () => {
    localStorage.setItem(COOKIE_KEY, 'accepted')
    setVisible(false)
  }

  const handleDecline = () => {
    localStorage.setItem(COOKIE_KEY, 'declined')
    setVisible(false)
  }

  if (!visible) return null

  return (
    <div className='fixed bottom-0 left-0 w-full bg-gray-900 text-white p-4 flex flex-col md:flex-row items-center justify-between z-50 shadow-lg'>
      <span className='mb-2 md:mb-0 text-sm'>
        This site uses cookies to enhance your experience. By continuing, you agree to our{' '}
        <a href='/privacy' className='underline text-cyan-400'>
          Privacy Policy
        </a>{' '}
        and{' '}
        <a href='/terms' className='underline text-cyan-400'>
          Terms of Service
        </a>
        .
      </span>
      <div className='flex gap-2'>
        <Button size='sm' variant='default' onClick={handleAccept}>
          Accept
        </Button>
        <Button size='sm' variant='outline' onClick={handleDecline}>
          Decline
        </Button>
      </div>
    </div>
  )
}
