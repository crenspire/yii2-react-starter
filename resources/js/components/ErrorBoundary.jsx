import { AlertCircle } from 'lucide-react'
import { Component } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

class ErrorBoundary extends Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error }
  }

  componentDidCatch(error, errorInfo) {
    console.error('Error caught by boundary:', error, errorInfo)
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-muted/50 p-4">
          <Card className="w-full max-w-md">
            <CardHeader>
              <div className="flex items-center justify-center mb-4">
                <AlertCircle className="h-8 w-8 text-destructive mr-2" />
                <CardTitle className="text-2xl">Something went wrong</CardTitle>
              </div>
              <CardDescription>
                An unexpected error occurred. Please try refreshing the page.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button
                onClick={() => window.location.reload()}
                className="w-full"
              >
                Refresh Page
              </Button>
            </CardContent>
          </Card>
        </div>
      )
    }

    return this.props.children
  }
}

export default ErrorBoundary
