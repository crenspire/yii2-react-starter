import { Head, Link, useForm } from '@inertiajs/react'
import { ArrowLeft, Loader2, TriangleAlert } from 'lucide-react'
import { FormField } from '@/components/FormField'
import AuthLayout from '@/components/layouts/AuthLayout'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

export default function ResetPassword({ token, valid }) {
  const { data, setData, post, processing, errors, reset } = useForm({
    token: token || '',
    password: '',
    password_confirm: '',
  })

  const submit = (e) => {
    e.preventDefault()
    post('/auth/reset-password', {
      onFinish: () => reset('password', 'password_confirm'),
    })
  }

  const linkInvalid = !valid || errors.token
  const footer = (
    <Link href="/auth/login" className="text-muted-foreground hover:text-foreground inline-flex items-center gap-2 font-medium">
      <ArrowLeft className="size-4" />
      Back to sign in
    </Link>
  )

  if (linkInvalid) {
    return (
      <AuthLayout title="Link expired" description="This password reset link is invalid or has already been used." footer={footer}>
        <Head title="Reset password" />
        <div className="grid gap-6">
          <div className="bg-muted/50 text-muted-foreground flex gap-3 rounded-lg border p-4 text-sm">
            <TriangleAlert className="text-foreground mt-0.5 size-4 shrink-0" />
            Reset links expire after an hour and can only be used once. Request a new one to continue.
          </div>
          <Button asChild className="w-full">
            <Link href="/auth/forgot-password">Request a new link</Link>
          </Button>
        </div>
      </AuthLayout>
    )
  }

  return (
    <AuthLayout title="Choose a new password" description="Enter a new password for your account" footer={footer}>
      <Head title="Reset password" />
      <form onSubmit={submit} className="grid gap-6">
        <FormField id="password" label="New password" error={errors.password} description="Use at least 8 characters.">
          <Input
            id="password"
            type="password"
            autoComplete="new-password"
            minLength={8}
            value={data.password}
            onChange={e => setData('password', e.target.value)}
            aria-invalid={!!errors.password}
            required
            autoFocus
          />
        </FormField>

        <FormField id="password_confirm" label="Confirm new password" error={errors.password_confirm}>
          <Input
            id="password_confirm"
            type="password"
            autoComplete="new-password"
            value={data.password_confirm}
            onChange={e => setData('password_confirm', e.target.value)}
            aria-invalid={!!errors.password_confirm}
            required
          />
        </FormField>

        <Button type="submit" className="w-full" disabled={processing}>
          {processing && <Loader2 className="animate-spin" />}
          Reset password
        </Button>
      </form>
    </AuthLayout>
  )
}
