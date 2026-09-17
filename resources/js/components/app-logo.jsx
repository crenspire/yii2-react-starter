import { cn } from '@/lib/utils'

/**
 * The brand mark on a rounded square, as used in the sidebar and auth pages.
 */
export function AppLogoIcon({ className }) {
  return (
    <div className={cn('flex aspect-square size-8 shrink-0 items-center justify-center rounded-lg bg-primary', className)}>
      <img src="/logo-light.png" alt="" className="size-[60%] dark:hidden" />
      <img src="/logo-dark.png" alt="" className="hidden size-[60%] dark:block" />
    </div>
  )
}
