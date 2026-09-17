import { Link } from '@inertiajs/react'
import { KeyRound, MoonStar, ShieldCheck, Users } from 'lucide-react'
import { AppLogoIcon } from '@/components/app-logo'
import { ThemeToggle } from '@/components/ThemeToggle'

const highlights = [
  { icon: ShieldCheck, title: 'Secure by default', text: 'CSRF protection, login throttling and hashed reset tokens.' },
  { icon: Users, title: 'Roles and user management', text: 'Admins manage accounts; everyone else manages their own.' },
  { icon: KeyRound, title: 'Complete auth flows', text: 'Sign up, sign in, password resets and password changes.' },
  { icon: MoonStar, title: 'Light and dark', text: 'Built on shadcn/ui and Tailwind CSS 4.' },
]

/**
 * Two-column authentication layout: the form on the left, a brand panel on the right.
 */
export default function AuthLayout({ title, description, children, footer }) {
  return (
    <div className="grid min-h-svh lg:grid-cols-2">
      <div className="flex flex-col gap-4 p-6 md:p-10">
        <div className="flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 font-medium">
            <AppLogoIcon className="size-7 rounded-md" />
            Yii2 Starter
          </Link>
          <ThemeToggle />
        </div>

        <div className="flex flex-1 items-center justify-center py-8">
          <div className="w-full max-w-sm">
            <div className="mb-8 flex flex-col gap-2 text-center">
              <h1 className="text-2xl font-bold tracking-tight">{title}</h1>
              {description && <p className="text-muted-foreground text-sm text-balance">{description}</p>}
            </div>
            {children}
            {footer && <div className="mt-6 text-center text-sm">{footer}</div>}
          </div>
        </div>
      </div>

      <AuthShowcase />
    </div>
  )
}

function AuthShowcase() {
  return (
    <div className="relative hidden overflow-hidden bg-zinc-950 text-zinc-50 lg:flex lg:flex-col lg:justify-between lg:p-12">
      {/* Grid backdrop with a soft glow in the brand colour */}
      <div
        aria-hidden
        className="absolute inset-0 opacity-[0.15] [background-image:linear-gradient(to_right,#fff_1px,transparent_1px),linear-gradient(to_bottom,#fff_1px,transparent_1px)] [background-size:44px_44px] [mask-image:radial-gradient(ellipse_at_center,black_20%,transparent_75%)]"
      />
      <div aria-hidden className="absolute -top-40 -right-32 size-[34rem] rounded-full bg-violet-600/30 blur-3xl" />
      <div aria-hidden className="absolute -bottom-48 -left-24 size-[28rem] rounded-full bg-indigo-500/20 blur-3xl" />

      <div className="relative flex items-center gap-2 text-sm text-zinc-400">
        <span className="inline-flex items-center rounded-full border border-white/10 bg-white/5 px-3 py-1 backdrop-blur">
          Yii2 · Inertia.js · React 19 · shadcn/ui
        </span>
      </div>

      <div className="relative space-y-10">
        <div className="space-y-4">
          <h2 className="max-w-md text-4xl leading-tight font-semibold tracking-tight">
            The admin starter kit you don&apos;t have to rebuild.
          </h2>
          <p className="max-w-md text-zinc-400">
            Authentication, roles and user management are done. Start on the features that matter.
          </p>
        </div>

        <ul className="grid max-w-lg gap-3 sm:grid-cols-2">
          {highlights.map(({ icon: Icon, title, text }) => (
            <li key={title} className="rounded-xl border border-white/10 bg-white/[0.04] p-4 backdrop-blur-sm">
              <Icon className="mb-3 size-5 text-violet-300" />
              <p className="text-sm font-medium">{title}</p>
              <p className="mt-1 text-sm text-zinc-400">{text}</p>
            </li>
          ))}
        </ul>
      </div>

      <p className="relative text-sm text-zinc-500">
        &copy;
        {' '}
        {new Date().getFullYear()}
        {' '}
        Crenspire
      </p>
    </div>
  )
}
