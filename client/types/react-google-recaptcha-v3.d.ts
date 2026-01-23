declare module 'react-google-recaptcha-v3' {
  import type { FC, ReactNode } from 'react'

  export interface GoogleReCaptchaProviderProps {
    reCaptchaKey: string
    scriptProps?: {
      async?: boolean
      defer?: boolean
      appendTo?: 'head' | 'body'
      nonce?: string
    }
    container?: {
      element?: string | HTMLElement
      parameters?: {
        badge?: 'bottomright' | 'bottomleft' | 'inline'
        theme?: 'light' | 'dark'
        size?: 'compact' | 'normal'
        tabindex?: number
      }
    }
    children: ReactNode
  }

  export const GoogleReCaptchaProvider: FC<GoogleReCaptchaProviderProps>

  export interface UseGoogleReCaptchaReturn {
    executeRecaptcha: (action?: string) => Promise<string>
    container?: string | HTMLElement
  }

  export function useGoogleReCaptcha(): UseGoogleReCaptchaReturn
}
