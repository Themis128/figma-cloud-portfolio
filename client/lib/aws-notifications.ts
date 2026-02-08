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

export const getFCMToken = async () => {
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

function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4)
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/')
  const rawData = window.atob(base64)
  const outputArray = new Uint8Array(rawData.length)
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i)
  }
  return outputArray
}

export default { messaging }
