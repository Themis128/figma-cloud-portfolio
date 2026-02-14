// AWS SNS Push Notification Service

export const messaging = {
  getToken: async () => {
    if (!('serviceWorker' in navigator)) return null

    const registration = await navigator.serviceWorker.ready
    const subscription = await registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: urlBase64ToUint8Array(import.meta.env['VITE_AWS_SNS_PUBLIC_KEY'] || ''),
    })

    return JSON.stringify(subscription)
  },
}

export const getFCMToken = () => {
  return messaging.getToken()
}

export const onMessageListener = () =>
  new Promise((resolve) => {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.addEventListener('message', (event) => {
        resolve(event.data)
      })
    }
  })

const BASE64_PADDING_CHAR = '='
const BASE64_CHUNK_SIZE = 4

function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = BASE64_PADDING_CHAR.repeat(
    (BASE64_CHUNK_SIZE - (base64String.length % BASE64_CHUNK_SIZE)) % BASE64_CHUNK_SIZE,
  )
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/')
  const rawData = window.atob(base64)
  const outputArray = new Uint8Array(rawData.length)
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i)
  }
  return outputArray
}

export default { messaging }
