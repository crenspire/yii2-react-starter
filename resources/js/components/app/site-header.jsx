import { Link } from '@inertiajs/react'
import { Fragment } from 'react'
import { ThemeToggle } from '@/components/ThemeToggle'
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb'
import { Separator } from '@/components/ui/separator'
import { SidebarTrigger } from '@/components/ui/sidebar'

/**
 * @param {{ breadcrumbs: { title: string, href?: string }[] }} props
 */
const noBreadcrumbs = []

export function SiteHeader({ breadcrumbs = noBreadcrumbs }) {
  return (
    <header className="flex h-(--header-height) shrink-0 items-center gap-2 border-b transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-(--header-height)">
      <div className="flex w-full items-center gap-1 px-4 lg:gap-2 lg:px-6">
        <SidebarTrigger className="-ml-1" />
        <Separator orientation="vertical" className="mx-2 data-[orientation=vertical]:h-4" />
        <Breadcrumb>
          <BreadcrumbList>
            {breadcrumbs.map((crumb, index) => {
              const isLast = index === breadcrumbs.length - 1
              return (
                <Fragment key={crumb.title}>
                  <BreadcrumbItem className={isLast ? undefined : 'hidden md:block'}>
                    {isLast || !crumb.href
                      ? <BreadcrumbPage>{crumb.title}</BreadcrumbPage>
                      : (
                          <BreadcrumbLink asChild>
                            <Link href={crumb.href}>{crumb.title}</Link>
                          </BreadcrumbLink>
                        )}
                  </BreadcrumbItem>
                  {!isLast && <BreadcrumbSeparator className="hidden md:block" />}
                </Fragment>
              )
            })}
          </BreadcrumbList>
        </Breadcrumb>
        <div className="ml-auto flex items-center gap-2">
          <ThemeToggle />
        </div>
      </div>
    </header>
  )
}
