import { Moon, Sun } from 'lucide-react'
import { useTheme } from 'next-themes'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

export function ThemeToggle({ className }) {
  const { resolvedTheme, setTheme } = useTheme()

  return (
    <Button
      variant="ghost"
      size="icon"
      className={cn('size-8', className)}
      onClick={() => setTheme(resolvedTheme === 'dark' ? 'light' : 'dark')}
    >
      <Sun className="dark:hidden" />
      <Moon className="hidden dark:block" />
      <span className="sr-only">Toggle theme</span>
    </Button>
  )
}
