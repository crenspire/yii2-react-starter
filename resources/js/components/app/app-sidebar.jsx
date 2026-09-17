import { Link, usePage } from '@inertiajs/react'
import { BookOpen, CreditCard, House, LayoutDashboard, Settings2, UserPlus, UserRound, Users } from 'lucide-react'
import { AppLogoIcon } from '@/components/app-logo'
import { NavMain } from '@/components/app/nav-main'
import { NavUser } from '@/components/app/nav-user'
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
} from '@/components/ui/sidebar'

export function AppSidebar(props) {
  const { url, props: { auth } } = usePage()
  const user = auth?.user
  const path = url.split('?')[0]
  const isAdmin = !!user?.isAdmin

  const platform = [
    { title: 'Dashboard', href: '/dashboard', icon: LayoutDashboard, isActive: path === '/dashboard' },
    isAdmin && { title: 'Users', href: '/users', icon: Users, isActive: path === '/users' || /^\/users\/\d+/.test(path) },
  ].filter(Boolean)

  const account = [
    { title: 'Profile', href: '/dashboard/profile', icon: UserRound, isActive: path === '/dashboard/profile' },
    { title: 'Settings', href: '/dashboard/settings', icon: Settings2, isActive: path === '/dashboard/settings' },
    { title: 'Billing', href: '/dashboard/billing', icon: CreditCard, isActive: path === '/dashboard/billing' },
  ]

  const secondary = [
    { title: 'Home page', href: '/', icon: House },
    { title: 'Documentation', href: 'https://github.com/crenspire/yii2-react-starter#readme', icon: BookOpen, external: true },
  ]

  return (
    <Sidebar collapsible="icon" variant="inset" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" asChild>
              <Link href="/dashboard">
                <AppLogoIcon />
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-semibold">Yii2 Starter</span>
                  <span className="text-muted-foreground truncate text-xs">{isAdmin ? 'Administrator' : 'Member'}</span>
                </div>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      <SidebarContent>
        {isAdmin && (
          <SidebarGroup>
            <SidebarGroupContent>
              <SidebarMenu>
                <SidebarMenuItem>
                  <SidebarMenuButton
                    asChild
                    tooltip="New user"
                    className="bg-primary text-primary-foreground hover:bg-primary/90 hover:text-primary-foreground active:bg-primary/90 active:text-primary-foreground min-w-8 duration-200 ease-linear"
                  >
                    <Link href="/users/create">
                      <UserPlus />
                      <span>New user</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        )}
        <NavMain label="Platform" items={platform} />
        <NavMain label="Account" items={account} />
        <NavMain items={secondary} className="mt-auto" />
      </SidebarContent>

      <SidebarFooter>
        <NavUser user={user} />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}
