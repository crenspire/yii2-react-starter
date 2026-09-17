import { Head, Link } from '@inertiajs/react'
import { BadgeCheck, CircleDashed, Pencil, ShieldCheck, UserRound } from 'lucide-react'
import AppLayout from '@/components/layouts/AppLayout'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { formatDateTime, formatRelative, initials } from '@/lib/format'

function Detail({ label, children }) {
  return (
    <div className="grid gap-1 py-3 sm:grid-cols-3 sm:gap-4">
      <dt className="text-muted-foreground text-sm">{label}</dt>
      <dd className="text-sm font-medium sm:col-span-2">{children}</dd>
    </div>
  )
}

export default function UserView({ user }) {
  return (
    <>
      <Head title={user.name} />
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-4">
          <Avatar className="size-14">
            <AvatarFallback className="text-lg">{initials(user.name)}</AvatarFallback>
          </Avatar>
          <div className="space-y-1">
            <h1 className="text-2xl font-semibold tracking-tight">{user.name}</h1>
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-muted-foreground text-sm">{user.email}</span>
              <Badge variant="outline" className="text-muted-foreground capitalize">
                {user.role === 'admin' ? <ShieldCheck /> : <UserRound />}
                {user.role}
              </Badge>
            </div>
          </div>
        </div>
        <Button asChild>
          <Link href={`/users/${user.id}/edit`}>
            <Pencil />
            Edit user
          </Link>
        </Button>
      </div>

      <Card className="max-w-3xl">
        <CardHeader>
          <CardTitle>Account</CardTitle>
          <CardDescription>Details about this user's account.</CardDescription>
        </CardHeader>
        <CardContent>
          <dl className="divide-y">
            <Detail label="User ID">{user.id}</Detail>
            <Detail label="Name">{user.name}</Detail>
            <Detail label="Email">{user.email}</Detail>
            <Detail label="Email status">
              <Badge variant="outline" className="text-muted-foreground px-1.5">
                {user.email_verified_at
                  ? <BadgeCheck className="fill-green-500 text-white dark:fill-green-400 dark:text-background" />
                  : <CircleDashed />}
                {user.email_verified_at ? `Verified ${formatRelative(user.email_verified_at)}` : 'Unverified'}
              </Badge>
            </Detail>
            <Detail label="Joined">{formatDateTime(user.created_at)}</Detail>
            <Detail label="Last updated">{formatDateTime(user.updated_at)}</Detail>
          </dl>
        </CardContent>
      </Card>
    </>
  )
}

UserView.layout = page => (
  <AppLayout breadcrumbs={[{ title: 'Users', href: '/users' }, { title: page.props.user.name }]}>{page}</AppLayout>
)
