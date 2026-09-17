import { usePage } from '@inertiajs/react'
import { useEffect } from 'react'
import { toast } from 'sonner'

const toastByType = {
  success: toast.success,
  error: toast.error,
  warning: toast.warning,
  info: toast.info,
}

/**
 * Shows one-time flash messages set on the server with Yii::$app->session->setFlash().
 */
export function FlashMessages() {
  const { flash } = usePage().props

  useEffect(() => {
    Object.entries(flash || {}).forEach(([type, messages]) => {
      const show = toastByType[type] || toast;
      [].concat(messages).forEach(message => show(message))
    })
  }, [flash])

  return null
}
