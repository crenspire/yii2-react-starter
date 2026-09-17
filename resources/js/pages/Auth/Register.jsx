import { Head, Link, useForm } from '@inertiajs/react'
import { Loader2 } from 'lucide-react'
import { FormField } from '@/components/FormField'
import AuthLayout from '@/components/layouts/AuthLayout'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

export default function Register({ model }) {
  const { data, setData, post, processing, errors, reset } = useForm({
    name: model?.name || '',
    email: model?.email || '',
    password: '',
    password_confirm: '',
  })

  const submit = (e) => {
    e.preventDefault()
    post('/auth/register', {
      onFinish: () => reset('password', 'password_confirm'),
    })
  }

  const input = (name, props) => (
    <Input
      id={name}
      value={data[name]}
      onChange={e => setData(name, e.target.value)}
      aria-invalid={!!errors[name]}
      required
      {...props}
    />
  )

  return (
    <AuthLayout
      title="Create an account"
      description="Enter your details below to get started"
      footer={(
        <>
          Already have an account?
          {' '}
          <Link href="/auth/login" className="font-medium underline underline-offset-4">Sign in</Link>
        </>
      )}
    >
      <Head title="Create an account" />
      <form onSubmit={submit} className="grid gap-6">
        <FormField id="name" label="Full name" error={errors.name}>
          {input('name', { autoComplete: 'name', placeholder: 'Jane Cooper', autoFocus: true })}
        </FormField>

        <FormField id="email" label="Email" error={errors.email}>
          {input('email', { type: 'email', autoComplete: 'email', placeholder: 'you@example.com' })}
        </FormField>

        <div className="grid gap-6 sm:grid-cols-2 sm:gap-4">
          <FormField id="password" label="Password" error={errors.password}>
            {input('password', { type: 'password', autoComplete: 'new-password', minLength: 8 })}
          </FormField>
          <FormField id="password_confirm" label="Confirm" error={errors.password_confirm}>
            {input('password_confirm', { type: 'password', autoComplete: 'new-password' })}
          </FormField>
        </div>
        <p className="text-muted-foreground -mt-4 text-sm">Use at least 8 characters.</p>

        <Button type="submit" className="w-full" disabled={processing}>
          {processing && <Loader2 className="animate-spin" />}
          Create account
        </Button>
      </form>
    </AuthLayout>
  )
}
