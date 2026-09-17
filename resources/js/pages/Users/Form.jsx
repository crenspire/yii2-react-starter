import { Head, Link, useForm } from '@inertiajs/react'
import { Loader2 } from 'lucide-react'
import { FormField } from '@/components/FormField'
import AppLayout from '@/components/layouts/AppLayout'
import { PageHeader } from '@/components/page-header'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Separator } from '@/components/ui/separator'

const roleDescriptions = {
  user: 'Can manage their own profile and settings.',
  admin: 'Can also manage every user, including roles.',
}

export default function UserForm({ user, roles, isSelf }) {
  const isEdit = !!user?.id
  const { data, setData, post, put, processing, errors } = useForm({
    name: user?.name || '',
    email: user?.email || '',
    password: '',
    role: user?.role || 'user',
  })

  const submit = (e) => {
    e.preventDefault()
    const options = { preserveScroll: true }
    if (isEdit)
      put(`/users/${user.id}/edit`, options)
    else
      post('/users/create', options)
  }

  return (
    <>
      <Head title={isEdit ? `Edit ${user.name}` : 'Add user'} />
      <PageHeader
        title={isEdit ? 'Edit user' : 'Add user'}
        description={isEdit ? `Update ${user.name}'s account details and access.` : 'Create an account for someone on your team.'}
      />

      <form onSubmit={submit} className="max-w-3xl">
        <Card>
          <CardHeader>
            <CardTitle>Account details</CardTitle>
            <CardDescription>The name and email address used to sign in.</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-6">
            <div className="grid gap-6 md:grid-cols-2">
              <FormField id="name" label="Name" error={errors.name}>
                <Input id="name" value={data.name} onChange={e => setData('name', e.target.value)} aria-invalid={!!errors.name} required />
              </FormField>
              <FormField id="email" label="Email" error={errors.email}>
                <Input id="email" type="email" value={data.email} onChange={e => setData('email', e.target.value)} aria-invalid={!!errors.email} required />
              </FormField>
            </div>

            <Separator />

            <div className="grid gap-6 md:grid-cols-2">
              <FormField
                id="password"
                label={isEdit ? 'New password' : 'Password'}
                error={errors.password}
                description={isEdit ? 'Leave blank to keep the current password.' : 'At least 8 characters.'}
              >
                <Input
                  id="password"
                  type="password"
                  autoComplete="new-password"
                  minLength={8}
                  value={data.password}
                  onChange={e => setData('password', e.target.value)}
                  aria-invalid={!!errors.password}
                  required={!isEdit}
                />
              </FormField>

              <FormField
                id="role"
                label="Role"
                error={errors.role}
                description={isSelf ? 'You can\'t change your own role.' : roleDescriptions[data.role]}
              >
                <Select value={data.role} onValueChange={value => setData('role', value)} disabled={isSelf}>
                  <SelectTrigger id="role" className="w-full" aria-invalid={!!errors.role}>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(roles || {}).map(([value, label]) => (
                      <SelectItem key={value} value={value}>{label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </FormField>
            </div>
          </CardContent>
          <CardFooter className="justify-end gap-2 border-t">
            <Button variant="outline" asChild>
              <Link href="/users">Cancel</Link>
            </Button>
            <Button type="submit" disabled={processing}>
              {processing && <Loader2 className="animate-spin" />}
              {isEdit ? 'Save changes' : 'Create user'}
            </Button>
          </CardFooter>
        </Card>
      </form>
    </>
  )
}

UserForm.layout = page => (
  <AppLayout
    breadcrumbs={[
      { title: 'Users', href: '/users' },
      ...(page.props.user?.id
        ? [{ title: page.props.user.name, href: `/users/${page.props.user.id}` }, { title: 'Edit' }]
        : [{ title: 'Add user' }]),
    ]}
  >
    {page}
  </AppLayout>
)
