import { Head, useForm, usePage } from '@inertiajs/react'
import { BadgeCheck, CircleDashed, Loader2 } from 'lucide-react'
import { FormField } from '@/components/FormField'
import AppLayout from '@/components/layouts/AppLayout'
import { PageHeader } from '@/components/page-header'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { initials } from '@/lib/format'

export default function Profile({ profile }) {
  const { user } = usePage().props.auth
  const { data, setData, put, processing, errors, isDirty, setDefaults } = useForm({
    name: profile?.name || '',
    email: profile?.email || '',
  })

  const submit = (e) => {
    e.preventDefault()
    put('/dashboard/profile', {
      preserveScroll: true,
      onSuccess: () => setDefaults(),
    })
  }

  return (
    <>
      <Head title="Profile" />
      <PageHeader title="Profile" description="Manage how you appear and how we contact you." />

      <form onSubmit={submit} className="max-w-3xl">
        <Card>
          <CardHeader>
            <div className="flex items-center gap-4">
              <Avatar className="size-12">
                <AvatarFallback>{initials(user?.name)}</AvatarFallback>
              </Avatar>
              <div className="grid gap-1">
                <CardTitle>{user?.name}</CardTitle>
                <CardDescription className="capitalize">{user?.role}</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="grid gap-6 md:grid-cols-2">
            <FormField id="name" label="Name" error={errors.name}>
              <Input id="name" autoComplete="name" value={data.name} onChange={e => setData('name', e.target.value)} aria-invalid={!!errors.name} required />
            </FormField>
            <FormField
              id="email"
              label="Email"
              error={errors.email}
              description="Changing your email marks it as unverified."
              labelAction={(
                <Badge variant="outline" className="text-muted-foreground px-1.5">
                  {profile?.emailVerified
                    ? <BadgeCheck className="fill-green-500 text-white dark:fill-green-400 dark:text-background" />
                    : <CircleDashed />}
                  {profile?.emailVerified ? 'Verified' : 'Unverified'}
                </Badge>
              )}
            >
              <Input id="email" type="email" autoComplete="email" value={data.email} onChange={e => setData('email', e.target.value)} aria-invalid={!!errors.email} required />
            </FormField>
          </CardContent>
          <CardFooter className="justify-end border-t">
            <Button type="submit" disabled={processing || !isDirty}>
              {processing && <Loader2 className="animate-spin" />}
              Save changes
            </Button>
          </CardFooter>
        </Card>
      </form>
    </>
  )
}

Profile.layout = page => <AppLayout breadcrumbs={[{ title: 'Account' }, { title: 'Profile' }]}>{page}</AppLayout>
