import { Link, router } from '@inertiajs/react'
import { CreditCard, EllipsisVertical, LogOut, Monitor, Moon, Palette, Settings2, Sun, UserRound } from 'lucide-react'
import { useTheme } from 'next-themes'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { SidebarMenu, SidebarMenuButton, SidebarMenuItem, useSidebar } from '@/components/ui/sidebar'
import { initials } from '@/lib/format'

function UserIdentity({ user }) {
  return (
    <>
      <Avatar className="size-8 rounded-lg">
        <AvatarFallback className="rounded-lg">{initials(user?.name)}</AvatarFallback>
      </Avatar>
      <div className="grid flex-1 text-left text-sm leading-tight">
        <span className="truncate font-medium">{user?.name}</span>
        <span className="text-muted-foreground truncate text-xs">{user?.email}</span>
      </div>
    </>
  )
}

export function NavUser({ user }) {
  const { isMobile, setOpenMobile } = useSidebar()
  const { theme, setTheme } = useTheme()
  const closeOnMobile = () => isMobile && setOpenMobile(false)

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <SidebarMenuButton
              size="lg"
              className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
            >
              <UserIdentity user={user} />
              <EllipsisVertical className="ml-auto size-4" />
            </SidebarMenuButton>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            className="w-(--radix-dropdown-menu-trigger-width) min-w-56 rounded-lg"
            side={isMobile ? 'bottom' : 'right'}
            align="end"
            sideOffset={4}
          >
            <DropdownMenuLabel className="p-0 font-normal">
              <div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
                <UserIdentity user={user} />
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuGroup>
              <DropdownMenuItem asChild>
                <Link href="/dashboard/profile" onClick={closeOnMobile}>
                  <UserRound />
                  Profile
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href="/dashboard/settings" onClick={closeOnMobile}>
                  <Settings2 />
                  Settings
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href="/dashboard/billing" onClick={closeOnMobile}>
                  <CreditCard />
                  Billing
                </Link>
              </DropdownMenuItem>
              <DropdownMenuSub>
                <DropdownMenuSubTrigger>
                  <Palette className="text-muted-foreground" />
                  Theme
                </DropdownMenuSubTrigger>
                <DropdownMenuSubContent>
                  <DropdownMenuRadioGroup value={theme} onValueChange={setTheme}>
                    <DropdownMenuRadioItem value="light">
                      <Sun />
                      Light
                    </DropdownMenuRadioItem>
                    <DropdownMenuRadioItem value="dark">
                      <Moon />
                      Dark
                    </DropdownMenuRadioItem>
                    <DropdownMenuRadioItem value="system">
                      <Monitor />
                      System
                    </DropdownMenuRadioItem>
                  </DropdownMenuRadioGroup>
                </DropdownMenuSubContent>
              </DropdownMenuSub>
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
            <DropdownMenuItem onSelect={() => router.post('/auth/logout')}>
              <LogOut />
              Log out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  )
}
