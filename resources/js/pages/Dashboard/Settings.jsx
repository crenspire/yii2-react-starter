import { Head, useForm } from '@inertiajs/react'
import { Check, Loader2, Monitor, Moon, Sun } from 'lucide-react'
import { useTheme } from 'next-themes'
import { FormField } from '@/components/FormField'
import AppLayout from '@/components/layouts/AppLayout'
import { PageHeader } from '@/components/page-header'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { cn } from '@/lib/utils'

const themes = [
  { value: 'light', label: 'Light', icon: Sun },
  { value: 'dark', label: 'Dark', icon: Moon },
  { value: 'system', label: 'System', icon: Monitor },
]

function ThemePreview({ dark }) {
  return (
    <div className={cn('space-y-2 rounded-md p-2', dark ? 'bg-neutral-900' : 'bg-neutral-100')}>
      <div className={cn('space-y-1.5 rounded-sm p-2 shadow-xs', dark ? 'bg-neutral-800' : 'bg-white')}>
        <div className={cn('h-1.5 w-2/3 rounded-full', dark ? 'bg-neutral-600' : 'bg-neutral-300')} />
        <div className={cn('h-1.5 w-full rounded-full', dark ? 'bg-neutral-600' : 'bg-neutral-300')} />
      </div>
      <div className={cn('flex items-center gap-1.5 rounded-sm p-2 shadow-xs', dark ? 'bg-neutral-800' : 'bg-white')}>
        <div className={cn('size-3 rounded-full', dark ? 'bg-neutral-600' : 'bg-neutral-300')} />
        <div className={cn('h-1.5 w-full rounded-full', dark ? 'bg-neutral-600' : 'bg-neutral-300')} />
      </div>
    </div>
  )
}

export default function Settings() {
  const { theme, setTheme } = useTheme()
  const form = useForm({
    current_password: '',
    password: '',
    password_confirm: '',
  })

  const submit = (e) => {
    e.preventDefault()
    form.put('/dashboard/password', {
      preserveScroll: true,
      onSuccess: () => form.reset(),
      onError: () => form.reset('password', 'password_confirm'),
    })
  }

  const passwordInput = (name, autoComplete, props = {}) => (
    <Input
      id={name}
      type="password"
      autoComplete={autoComplete}
      value={form.data[name]}
      onChange={e => form.setData(name, e.target.value)}
      aria-invalid={!!form.errors[name]}
      required
      {...props}
    />
  )

  return (
    <>
      <Head title="Settings" />
      <PageHeader title="Settings" description="Manage your password and preferences." />

      <div className="grid max-w-3xl gap-6">
        <form onSubmit={submit}>
          <Card>
            <CardHeader>
              <CardTitle>Password</CardTitle>
              <CardDescription>Changing your password signs you out on all other devices.</CardDescription>
            </CardHeader>
            <CardContent className="grid gap-6">
              <FormField id="current_password" label="Current password" error={form.errors.current_password}>
                {passwordInput('current_password', 'current-password')}
              </FormField>
              <div className="grid gap-6 md:grid-cols-2">
                <FormField id="password" label="New password" error={form.errors.password} description="At least 8 characters.">
                  {passwordInput('password', 'new-password', { minLength: 8 })}
                </FormField>
                <FormField id="password_confirm" label="Confirm new password" error={form.errors.password_confirm}>
                  {passwordInput('password_confirm', 'new-password')}
                </FormField>
              </div>
            </CardContent>
            <CardFooter className="justify-end border-t">
              <Button type="submit" disabled={form.processing}>
                {form.processing && <Loader2 className="animate-spin" />}
                Update password
              </Button>
            </CardFooter>
          </Card>
        </form>

        <Card>
          <CardHeader>
            <CardTitle>Appearance</CardTitle>
            <CardDescription>Choose how the application looks on this device.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-3 gap-4" role="radiogroup" aria-label="Theme">
              {themes.map(({ value, label, icon: Icon }) => {
                const selected = theme === value
                return (
                  <button
                    key={value}
                    type="button"
                    role="radio"
                    aria-checked={selected}
                    onClick={() => setTheme(value)}
                    className={cn(
                      'group rounded-lg border-2 p-1 text-left transition-colors outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50',
                      selected ? 'border-primary' : 'border-muted hover:border-accent-foreground/20',
                    )}
                  >
                    {value === 'system'
                      ? (
                          <div className="grid grid-cols-2 overflow-hidden rounded-md">
                            <ThemePreview />
                            <ThemePreview dark />
                          </div>
                        )
                      : <ThemePreview dark={value === 'dark'} />}
                    <div className="flex items-center gap-2 px-1.5 py-2 text-sm font-medium">
                      <Icon className="text-muted-foreground size-4" />
                      {label}
                      {selected && <Check className="ml-auto size-4" />}
                    </div>
                  </button>
                )
              })}
            </div>
          </CardContent>
        </Card>
      </div>
    </>
  )
}

Settings.layout = page => <AppLayout breadcrumbs={[{ title: 'Account' }, { title: 'Settings' }]}>{page}</AppLayout>
