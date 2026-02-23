import { Eye, HelpCircle } from 'lucide-react'
import { useState } from 'react'
import AccessibilityEnhancer from '@/components/AccessibilityEnhancer'

export function AccessibilityButton() {
  const [open, setOpen] = useState(false)

  return (
    <>
      <button
        aria-label='Accessibility Settings'
        className='fixed bottom-6 right-6 z-50 bg-cyan-500 text-white rounded-full shadow-lg p-3 hover:bg-cyan-600 focus:outline-none focus:ring-2 focus:ring-cyan-400 transition-all'
        onClick={() => setOpen((v) => !v)}
        type='button'
      >
        <Eye className='w-6 h-6' />
        <span className='sr-only'>Accessibility</span>
      </button>
      {open && (
        <div className='fixed bottom-20 right-6 z-50 bg-white dark:bg-gray-900 rounded-lg shadow-lg p-6 w-80 max-w-full'>
          <AccessibilityEnhancer />
          <button
            aria-label='Close Accessibility Settings'
            className='mt-4 w-full bg-cyan-500 text-white rounded py-2 hover:bg-cyan-600 focus:outline-none focus:ring-2 focus:ring-cyan-400 transition-all'
            onClick={() => setOpen(false)}
            type='button'
          >
            <HelpCircle className='inline-block mr-2 w-5 h-5' /> Close
          </button>
        </div>
      )}
    </>
  )
}
