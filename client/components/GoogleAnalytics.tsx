import { useEffect } from 'react'
import ReactGA from 'react-ga4'
import { useLocation } from 'react-router-dom'

const GoogleAnalytics = () => {
  const location = useLocation()

  useEffect(() => {
    const measurementId =
      import.meta.env.VITE_GOOGLE_ANALYTICS_ID || import.meta.env.GOOGLE_ANALYTICS_ID

    if (measurementId && !ReactGA.isInitialized) {
      ReactGA.initialize(measurementId)
    }
  }, [])

  useEffect(() => {
    if (ReactGA.isInitialized) {
      ReactGA.send({ hitType: 'pageview', page: location.pathname + location.search })
    }
  }, [location])

  return null
}

export default GoogleAnalytics
