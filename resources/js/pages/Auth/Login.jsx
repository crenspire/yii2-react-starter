import { Head, Link, useForm } from '@inertiajs/react'
import { Loader2 } from 'lucide-react'
import { FormField } from '@/components/FormField'
import AuthLayout from '@/components/layouts/AuthLayout'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

export default function Login({ model }) {
  const { data, setData, post, processing, errors, reset } = useForm({
    email: model?.email || '',
    password: '',
    rememberMe: model?.rememberMe || false,
  })

  const submit = (e) => {
    e.preventDefault()
    post('/auth/login', {
      onFinish: () => reset('password'),
    })
  }

  return (
    <AuthLayout
      title="Welcome back"
      description="Enter your email and password to sign in to your account"
      footer={(
        <>
          Don&apos;t have an account?
          {' '}
          <Link href="/auth/register" className="font-medium underline underline-offset-4">Sign up</Link>
        </>
      )}
    >
      <Head title="Sign in" />
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

        <FormField
          id="password"
          label="Password"
          error={errors.password}
          labelAction={(
            <Link href="/auth/forgot-password" className="text-muted-foreground hover:text-foreground text-sm underline-offset-4 hover:underline">
              Forgot your password?
            </Link>
          )}
        >
          <Input
            id="password"
            type="password"
            autoComplete="current-password"
            value={data.password}
            onChange={e => setData('password', e.target.value)}
            aria-invalid={!!errors.password}
            required
          />
        </FormField>

        <div className="flex items-center gap-3">
          <Checkbox
            id="rememberMe"
            checked={data.rememberMe}
            onCheckedChange={checked => setData('rememberMe', checked === true)}
          />
          <Label htmlFor="rememberMe" className="font-normal">Keep me signed in</Label>
        </div>

        <Button type="submit" className="w-full" disabled={processing}>
          {processing && <Loader2 className="animate-spin" />}
          Sign in
        </Button>
      </form>
    </AuthLayout>
  )
}
