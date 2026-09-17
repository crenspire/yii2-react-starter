import { Head, Link } from '@inertiajs/react'
import { ArrowLeft, Home } from 'lucide-react'
import { Button } from '@/components/ui/button'

const descriptions = {
  403: 'You don\'t have permission to access this page.',
  404: 'The page you\'re looking for doesn\'t exist or has been moved.',
  405: 'This action can\'t be performed that way.',
  429: 'Too many requests. Please wait a moment and try again.',
}

export default function Error({ status = 404, message = 'Page not found' }) {
  const description = descriptions[status]
    || (status >= 500 ? 'Something went wrong on our end. Please try again later.' : 'The request could not be completed.')

  return (
    <>
      <Head title={`${status} | Yii2 - Modern Starter Kit`} />
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <div className="max-w-md w-full text-center space-y-6">
          <div className="space-y-2">
            <h1 className="text-6xl font-bold text-foreground">{status}</h1>
            <h2 className="text-2xl font-semibold text-foreground">{message}</h2>
            <p className="text-muted-foreground">{description}</p>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button asChild variant="default">
              <Link href="/">
                <Home className="mr-2 h-4 w-4" />
                Go Home
              </Link>
            </Button>
            <Button variant="outline" onClick={() => window.history.back()}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Go Back
            </Button>
          </div>
        </div>
      </div>
    </>
  )
}
