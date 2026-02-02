import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Contact',
  description:
    'Get in touch with Themistoklis Baltzakis for collaboration, consulting, or job opportunities.',
}

export default function ContactPage() {
  return (
    <div className='min-h-screen bg-background'>
      <div className='container mx-auto px-4 py-20'>
        <h1 className='text-4xl font-bold text-foreground mb-8'>Get In Touch</h1>
        <div className='max-w-2xl'>
          <p className='text-foreground/80 text-lg mb-8'>
            I&apos;m always open to discussing new projects, creative ideas, or opportunities to be
            part of your vision.
          </p>
          <div className='space-y-4'>
            <div className='flex items-center gap-4'>
              <span className='text-cyan-400 font-semibold'>Email:</span>
              <a
                href='mailto:baltzakis.themis@gmail.com'
                className='text-foreground hover:text-cyan-400 transition-colors'
              >
                baltzakis.themis@gmail.com
              </a>
            </div>
            <div className='flex items-center gap-4'>
              <span className='text-cyan-400 font-semibold'>LinkedIn:</span>
              <a
                href='https://linkedin.com/in/baltzakis-themis'
                target='_blank'
                rel='noopener noreferrer'
                className='text-foreground hover:text-cyan-400 transition-colors'
              >
                linkedin.com/in/baltzakis-themis
              </a>
            </div>
            <div className='flex items-center gap-4'>
              <span className='text-cyan-400 font-semibold'>GitHub:</span>
              <a
                href='https://github.com/Themis128'
                target='_blank'
                rel='noopener noreferrer'
                className='text-foreground hover:text-cyan-400 transition-colors'
              >
                github.com/Themis128
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
