import { Link } from '@inertiajs/react'
import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from '@/components/ui/sidebar'

/**
 * A labelled group of sidebar links. Items: { title, href, icon, isActive, external }
 */
export function NavMain({ label, items, className }) {
  const { isMobile, setOpenMobile } = useSidebar()
  // The layout persists between visits, so close the mobile sheet ourselves after navigating
  const closeOnMobile = () => isMobile && setOpenMobile(false)

  return (
    <SidebarGroup className={className}>
      {label && <SidebarGroupLabel>{label}</SidebarGroupLabel>}
      <SidebarGroupContent>
        <SidebarMenu>
          {items.map(item => (
            <SidebarMenuItem key={item.title}>
              <SidebarMenuButton asChild isActive={item.isActive} tooltip={item.title}>
                {item.external
                  ? (
                      <a href={item.href} target="_blank" rel="noreferrer">
                        <item.icon />
                        <span>{item.title}</span>
                      </a>
                    )
                  : (
                      <Link href={item.href} onClick={closeOnMobile}>
                        <item.icon />
                        <span>{item.title}</span>
                      </Link>
                    )}
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  )
}
