import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'

export function ContactForm() {
  return (
    <form className='space-y-4'>
      <Input name='name' placeholder='Your Name' required />
      <Input name='email' type='email' placeholder='Your Email' required />
      <Input name='subject' placeholder='Subject' />
      <Textarea name='message' placeholder='Your Message' required />
      <Button type='submit'>Send</Button>
    </form>
  )
}
