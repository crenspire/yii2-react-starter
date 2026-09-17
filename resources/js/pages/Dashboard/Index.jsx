import { Head, Link, usePage } from '@inertiajs/react'
import { ArrowRight, BadgeCheck, CalendarDays, KeyRound, Mail, Palette, ShieldCheck, TrendingDown, TrendingUp, UserPlus, UserRound, Users } from 'lucide-react'
import { Area, AreaChart, CartesianGrid, XAxis } from 'recharts'
import AppLayout from '@/components/layouts/AppLayout'
import { PageHeader } from '@/components/page-header'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardAction, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart'
import { formatDate, formatRelative, initials } from '@/lib/format'

const chartConfig = {
  users: { label: 'Sign-ups', color: 'var(--chart-1)' },
}

function percentChange(current, previous) {
  if (previous === 0)
    return current > 0 ? 100 : 0
  return Math.round(((current - previous) / previous) * 100)
}

function StatCard({ label, value, badge, badgeIcon: BadgeIcon, footer, footerIcon: FooterIcon, hint }) {
  return (
    <Card className="@container/card">
      <CardHeader>
        <CardDescription>{label}</CardDescription>
        <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
          {value.toLocaleString()}
        </CardTitle>
        <CardAction>
          <Badge variant="outline">
            <BadgeIcon />
            {badge}
          </Badge>
        </CardAction>
      </CardHeader>
      <CardFooter className="flex-col items-start gap-1.5 text-sm">
        <div className="line-clamp-1 flex gap-2 font-medium">
          {footer}
          <FooterIcon className="size-4" />
        </div>
        <div className="text-muted-foreground">{hint}</div>
      </CardFooter>
    </Card>
  )
}

function AdminDashboard({ stats, recentUsers }) {
  const change = percentChange(stats.newThisMonth, stats.newLastMonth)
  const verifiedShare = stats.totalUsers ? Math.round((stats.verifiedUsers / stats.totalUsers) * 100) : 0
  const signupsTotal = stats.signups.reduce((sum, month) => sum + month.users, 0)
  const TrendIcon = change >= 0 ? TrendingUp : TrendingDown

  return (
    <>
      <div className="grid grid-cols-1 gap-4 *:data-[slot=card]:bg-gradient-to-t *:data-[slot=card]:from-primary/5 *:data-[slot=card]:to-card *:data-[slot=card]:shadow-xs @xl/main:grid-cols-2 @5xl/main:grid-cols-4 dark:*:data-[slot=card]:bg-card">
        <StatCard
          label="Total users"
          value={stats.totalUsers}
          badge={`+${stats.newThisMonth}`}
          badgeIcon={TrendingUp}
          footer={`${stats.newThisMonth} joined this month`}
          footerIcon={UserPlus}
          hint="Active, non-deleted accounts"
        />
        <StatCard
          label="New this month"
          value={stats.newThisMonth}
          badge={`${change >= 0 ? '+' : ''}${change}%`}
          badgeIcon={TrendIcon}
          footer={change >= 0 ? 'Up from last month' : 'Down from last month'}
          footerIcon={TrendIcon}
          hint={`${stats.newLastMonth} sign-ups last month`}
        />
        <StatCard
          label="Verified emails"
          value={stats.verifiedUsers}
          badge={`${verifiedShare}%`}
          badgeIcon={BadgeCheck}
          footer={`${verifiedShare}% of all accounts`}
          footerIcon={BadgeCheck}
          hint={`${stats.totalUsers - stats.verifiedUsers} still unverified`}
        />
        <StatCard
          label="Administrators"
          value={stats.admins}
          badge="Admin"
          badgeIcon={ShieldCheck}
          footer="Can manage all users"
          footerIcon={ShieldCheck}
          hint="Change roles from the Users page"
        />
      </div>

      <div className="grid grid-cols-1 gap-4 @5xl/main:grid-cols-7">
        <Card className="@container/card @5xl/main:col-span-4">
          <CardHeader>
            <CardTitle>Sign-ups</CardTitle>
            <CardDescription>New accounts over the last six months</CardDescription>
            <CardAction>
              <Badge variant="secondary" className="tabular-nums">
                {signupsTotal.toLocaleString()}
                {' '}
                total
              </Badge>
            </CardAction>
          </CardHeader>
          <CardContent className="px-2 pt-2 sm:px-6">
            <ChartContainer config={chartConfig} className="aspect-auto h-[260px] w-full">
              <AreaChart data={stats.signups} margin={{ left: 12, right: 12 }}>
                <defs>
                  <linearGradient id="fillUsers" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="var(--color-users)" stopOpacity={0.8} />
                    <stop offset="95%" stopColor="var(--color-users)" stopOpacity={0.1} />
                  </linearGradient>
                </defs>
                <CartesianGrid vertical={false} />
                <XAxis dataKey="month" tickLine={false} axisLine={false} tickMargin={8} />
                <ChartTooltip cursor={false} content={<ChartTooltipContent indicator="dot" />} />
                <Area dataKey="users" type="natural" fill="url(#fillUsers)" stroke="var(--color-users)" strokeWidth={2} />
              </AreaChart>
            </ChartContainer>
          </CardContent>
        </Card>

        <Card className="@5xl/main:col-span-3">
          <CardHeader>
            <CardTitle>Recent users</CardTitle>
            <CardDescription>The latest accounts to join</CardDescription>
            <CardAction>
              <Button variant="ghost" size="sm" asChild>
                <Link href="/users">
                  View all
                  <ArrowRight />
                </Link>
              </Button>
            </CardAction>
          </CardHeader>
          <CardContent>
            {recentUsers.length === 0
              ? <p className="text-muted-foreground py-8 text-center text-sm">No users yet.</p>
              : (
                  <ul className="grid gap-5">
                    {recentUsers.map(user => (
                      <li key={user.id} className="flex items-center gap-3">
                        <Avatar className="size-9">
                          <AvatarFallback>{initials(user.name)}</AvatarFallback>
                        </Avatar>
                        <div className="grid min-w-0 flex-1 gap-0.5">
                          <Link href={`/users/${user.id}`} className="truncate text-sm leading-none font-medium hover:underline">
                            {user.name}
                          </Link>
                          <span className="text-muted-foreground truncate text-sm">{user.email}</span>
                        </div>
                        <div className="flex shrink-0 flex-col items-end gap-1">
                          {user.role === 'admin' && <Badge variant="secondary">Admin</Badge>}
                          <span className="text-muted-foreground text-xs">{formatRelative(user.created_at)}</span>
                        </div>
                      </li>
                    ))}
                  </ul>
                )}
          </CardContent>
        </Card>
      </div>
    </>
  )
}

function MemberDashboard({ account }) {
  const shortcuts = [
    { title: 'Profile', description: 'Update your name and email address.', href: '/dashboard/profile', icon: UserRound },
    { title: 'Password', description: 'Change your password and sign out other devices.', href: '/dashboard/settings', icon: KeyRound },
    { title: 'Appearance', description: 'Switch between light, dark and system themes.', href: '/dashboard/settings', icon: Palette },
  ]

  return (
    <>
      <div className="grid grid-cols-1 gap-4 @xl/main:grid-cols-2">
        <Card className="bg-gradient-to-t from-primary/5 to-card shadow-xs dark:bg-card">
          <CardHeader>
            <CardDescription>Email status</CardDescription>
            <CardTitle className="text-2xl font-semibold">{account.emailVerified ? 'Verified' : 'Not verified'}</CardTitle>
            <CardAction>
              <Badge variant="outline">
                <Mail />
                Email
              </Badge>
            </CardAction>
          </CardHeader>
          <CardFooter className="text-muted-foreground text-sm">
            {account.emailVerified ? 'Your email address has been confirmed.' : 'Your email address has not been confirmed yet.'}
          </CardFooter>
        </Card>
        <Card className="bg-gradient-to-t from-primary/5 to-card shadow-xs dark:bg-card">
          <CardHeader>
            <CardDescription>Member since</CardDescription>
            <CardTitle className="text-2xl font-semibold">{formatDate(account.memberSince, { year: 'numeric', month: 'long' })}</CardTitle>
            <CardAction>
              <Badge variant="outline">
                <CalendarDays />
                Joined
              </Badge>
            </CardAction>
          </CardHeader>
          <CardFooter className="text-muted-foreground text-sm">
            Account created
            {' '}
            {formatRelative(account.memberSince)}
            .
          </CardFooter>
        </Card>
      </div>

      <div className="grid grid-cols-1 gap-4 @3xl/main:grid-cols-3">
        {shortcuts.map(({ title, description, href, icon: Icon }) => (
          <Link key={title} href={href} className="group">
            <Card className="hover:bg-accent/50 h-full transition-colors">
              <CardHeader>
                <div className="bg-muted mb-2 flex size-9 items-center justify-center rounded-lg border">
                  <Icon className="size-4" />
                </div>
                <CardTitle>{title}</CardTitle>
                <CardDescription>{description}</CardDescription>
                <CardAction>
                  <ArrowRight className="text-muted-foreground size-4 transition-transform group-hover:translate-x-0.5" />
                </CardAction>
              </CardHeader>
            </Card>
          </Link>
        ))}
      </div>
    </>
  )
}

export default function Dashboard({ stats, recentUsers, account }) {
  const { user } = usePage().props.auth

  return (
    <>
      <Head title="Dashboard" />
      <PageHeader title={`Welcome back, ${user?.name?.split(' ')[0] ?? ''}`} description="Here's what's happening with your application.">
        {stats && (
          <>
            <Button variant="outline" asChild>
              <Link href="/users">
                <Users />
                Manage users
              </Link>
            </Button>
            <Button asChild>
              <Link href="/users/create">
                <UserPlus />
                New user
              </Link>
            </Button>
          </>
        )}
      </PageHeader>
      {stats ? <AdminDashboard stats={stats} recentUsers={recentUsers} /> : <MemberDashboard account={account} />}
    </>
  )
}

Dashboard.layout = page => <AppLayout breadcrumbs={[{ title: 'Dashboard' }]}>{page}</AppLayout>
