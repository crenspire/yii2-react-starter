import { AppSidebar } from '@/components/app/app-sidebar'
import { SiteHeader } from '@/components/app/site-header'
import { SidebarInset, SidebarProvider } from '@/components/ui/sidebar'

// The sidebar component stores its open/collapsed state in this cookie
function sidebarDefaultOpen() {
  return typeof document === 'undefined' || !document.cookie.split('; ').includes('sidebar_state=false')
}

/**
 * Dashboard shell: collapsible sidebar, header with breadcrumbs and the page content.
 *
 * Use it as a persistent layout so the sidebar keeps its state between visits:
 *   Page.layout = page => <AppLayout breadcrumbs={[{ title: 'Dashboard' }]}>{page}</AppLayout>
 */
export default function AppLayout({ breadcrumbs, children }) {
  return (
    <SidebarProvider
      defaultOpen={sidebarDefaultOpen()}
      style={{
        '--sidebar-width': 'calc(var(--spacing) * 64)',
        '--header-height': 'calc(var(--spacing) * 14)',
      }}
    >
      <AppSidebar />
      <SidebarInset>
        <SiteHeader breadcrumbs={breadcrumbs} />
        <div className="@container/main flex flex-1 flex-col gap-6 p-4 md:p-6">
          {children}
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}
