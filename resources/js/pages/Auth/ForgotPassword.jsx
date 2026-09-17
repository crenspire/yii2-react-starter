import { Head, Link, useForm } from '@inertiajs/react'
import { ArrowLeft, Loader2 } from 'lucide-react'
import { FormField } from '@/components/FormField'
import AuthLayout from '@/components/layouts/AuthLayout'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

export default function ForgotPassword() {
  const { data, setData, post, processing, errors, reset } = useForm({
    email: '',
  })

  const submit = (e) => {
    e.preventDefault()
    post('/auth/forgot-password', {
      onSuccess: () => reset(),
    })
  }

  return (
    <AuthLayout
      title="Forgot your password?"
      description="Enter your email and we'll send you a link to reset it"
      footer={(
        <Link href="/auth/login" className="text-muted-foreground hover:text-foreground inline-flex items-center gap-2 font-medium">
          <ArrowLeft className="size-4" />
          Back to sign in
        </Link>
      )}
    >
      <Head title="Forgot password" />
      <form onSubmit={submit} className="grid gap-6">
        <FormField id="email" label="Email" error={errors.email}>
          <Input
            id="email"
            type="email"
            autoComplete="email"
            placeholder="you@example.com"
            value={data.email}
            onChange={e => setData('email', e.target.value)}
            aria-invalid={!!errors.email}
            required
            autoFocus
          />
        </FormField>

        <Button type="submit" className="w-full" disabled={processing}>
          {processing && <Loader2 className="animate-spin" />}
          Send reset link
        </Button>
      </form>
    </AuthLayout>
  )
}
