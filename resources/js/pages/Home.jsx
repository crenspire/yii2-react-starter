import { Head, Link } from '@inertiajs/react'
import {
  Check,
  Code,
  Container,
  Copy,
  Github,
  Globe,
  Key,
  Menu,
  Palette,
  Rocket,
  Shield,
  Sparkles,
  Zap,
} from 'lucide-react'
import { useState } from 'react'
import { AppLogoIcon } from '@/components/app-logo'
import { ThemeToggle } from '@/components/ThemeToggle'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Sheet, SheetClose, SheetContent, SheetTrigger } from '@/components/ui/sheet'

function CodeBlock() {
  const [copied, setCopied] = useState(false)
  const commands = [
    'git clone https://github.com/crenspire/yii2-react-starter',
    'cd yii2-react-starter && composer install && npm install',
    'cp .env.example .env && php yii migrate',
    'npm run serve',
  ]

  const copyToClipboard = () => {
    const text = commands.join('\n')
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    })
  }

  return (
    <div className="relative mt-8">
      <div className="rounded-lg border bg-card overflow-hidden shadow-lg">
        {/* Terminal Header */}
        <div className="flex items-center justify-between bg-muted px-4 py-2 border-b">
          <div className="flex items-center gap-2">
            <div className="h-3 w-3 rounded-full bg-red-500"></div>
            <div className="h-3 w-3 rounded-full bg-yellow-500"></div>
            <div className="h-3 w-3 rounded-full bg-green-500"></div>
          </div>
          <button
            onClick={copyToClipboard}
            className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            {copied
              ? (
                  <>
                    <Check className="h-4 w-4" />
                    <span>Copied!</span>
                  </>
                )
              : (
                  <>
                    <Copy className="h-4 w-4" />
                    <span>Copy</span>
                  </>
                )}
          </button>
        </div>

        {/* Terminal Content */}
        <div className="bg-[#1e1e1e] dark:bg-[#0d1117] p-6 font-mono text-sm">
          <div className="space-y-2">
            {commands.map((cmd, index) => (
              <div key={index} className="flex items-start">
                <span className="text-green-400 dark:text-green-500 mr-2 select-none">$</span>
                <span className="text-gray-300 dark:text-gray-200">{cmd}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

export default function Home({ auth }) {
  const user = auth?.user
  const features = [
    {
      icon: Rocket,
      title: 'Lightning Fast',
      description: 'Built for speed with modern technologies and optimized performance.',
    },
    {
      icon: Shield,
      title: 'Secure by Default',
      description: 'Enterprise-grade security with encryption and best practices.',
    },
    {
      icon: Zap,
      title: 'Scalable',
      description: 'Grows with your business, from startup to enterprise scale.',
    },
    {
      icon: Globe,
      title: 'Global Reach',
      description: 'Deploy anywhere, serve users worldwide with CDN support.',
    },
    {
      icon: Code,
      title: '10x Dev Experience',
      description: 'Streamlined development workflow with hot reload, TypeScript, and modern tooling.',
    },
    {
      icon: Container,
      title: 'Production Docker Ready',
      description: 'Pre-configured Docker setup for easy deployment and containerization.',
    },
    {
      icon: Key,
      title: 'Advanced Authentication',
      description: 'Complete auth system with login, registration, password reset, and more.',
    },
    {
      icon: Palette,
      title: 'Customizable UI',
      description: 'Built with ShadCN/UI components that are fully customizable and themeable.',
    },
  ]

  return (
    <>
      <Head title="Home | Yii2 - Modern Starter Kit" />
      <div className="min-h-screen bg-background">
        {/* Navigation */}
        <nav className="sticky top-0 z-50 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex h-16 items-center justify-between">
              {/* Left side: Logo + Navigation Links */}
              <div className="flex items-center gap-6">
                <Link href="/" className="flex items-center cursor-pointer hover:opacity-80 transition-opacity">
                  <AppLogoIcon className="mr-2 size-7" />
                  <span className="text-xl font-bold text-foreground">Starter</span>
                </Link>

                {/* Desktop Navigation Links */}
                <div className="hidden md:flex items-center gap-4">
                  <Link
                    href="#features"
                    className="text-sm font-medium text-foreground hover:opacity-80 transition-opacity cursor-pointer"
                  >
                    Features
                  </Link>
                  <Link
                    href="/docs"
                    className="text-sm font-medium text-foreground hover:opacity-80 transition-opacity cursor-pointer"
                  >
                    Docs
                  </Link>
                </div>
              </div>

              {/* Right side: Auth buttons + Theme toggle + GitHub */}
              <div className="hidden md:flex items-center gap-4">
                {user
                  ? (
                      <Button asChild variant="outline">
                        <Link href="/dashboard">Dashboard</Link>
                      </Button>
                    )
                  : (
                      <>
                        <Button asChild variant="outline">
                          <Link href="/auth/login">Login</Link>
                        </Button>
                        <Button asChild variant="outline">
                          <Link href="/auth/register">Register</Link>
                        </Button>
                      </>
                    )}
                <ThemeToggle />
                <Button variant="ghost" size="icon" asChild>
                  <a href="https://github.com" target="_blank" rel="noopener noreferrer" className="cursor-pointer">
                    <Github className="h-5 w-5" />
                  </a>
                </Button>
              </div>

              {/* Mobile Menu */}
              <div className="md:hidden">
                <Sheet>
                  <SheetTrigger asChild>
                    <Button size="icon" variant="outline">
                      <Menu className="h-6 w-6" />
                      <span className="sr-only">Toggle menu</span>
                    </Button>
                  </SheetTrigger>
                  <SheetContent side="right" className="w-[300px] sm:w-[400px]">
                    <div className="flex flex-col space-y-4 mt-8">
                      <SheetClose asChild>
                        <Link
                          href="#features"
                          className="text-sm font-medium text-foreground hover:opacity-80 transition-opacity cursor-pointer py-2"
                        >
                          Features
                        </Link>
                      </SheetClose>
                      <SheetClose asChild>
                        <Link
                          href="/docs"
                          className="text-sm font-medium text-foreground hover:opacity-80 transition-opacity cursor-pointer py-2"
                        >
                          Docs
                        </Link>
                      </SheetClose>
                      <div className="flex items-center justify-between py-2">
                        <span className="text-sm font-medium text-foreground">Theme</span>
                        <ThemeToggle />
                      </div>
                      {user
                        ? (
                            <SheetClose asChild>
                              <Button asChild variant="outline" className="w-full">
                                <Link href="/dashboard">Dashboard</Link>
                              </Button>
                            </SheetClose>
                          )
                        : (
                            <>
                              <SheetClose asChild>
                                <Button asChild variant="outline" className="w-full">
                                  <Link href="/auth/login">Login</Link>
                                </Button>
                              </SheetClose>
                              <SheetClose asChild>
                                <Button asChild variant="outline" className="w-full">
                                  <Link href="/auth/register">Register</Link>
                                </Button>
                              </SheetClose>
                            </>
                          )}
                      <Button variant="ghost" className="w-full" asChild>
                        <a href="https://github.com" target="_blank" rel="noopener noreferrer" className="flex items-center justify-center gap-2">
                          <Github className="h-5 w-5" />
                          <span>Github</span>
                        </a>
                      </Button>
                    </div>
                  </SheetContent>
                </Sheet>
              </div>
            </div>
          </div>
        </nav>

        {/* Hero Section */}
        <section className="relative overflow-hidden py-20 sm:py-32">
          <div className="container relative mx-auto px-4 sm:px-6 lg:px-8">
            <div className="mx-auto max-w-4xl text-center">
              {/* Badge */}
              <div className="inline-flex items-center gap-2 rounded-full border bg-muted/50 px-4 py-1.5 text-sm mb-8">
                <Sparkles className="h-4 w-4" />
                <span className="text-muted-foreground">
                  Using PHP 8.2+, Yii2, Inertia v2, React 19 and Tailwind CSS 4+
                </span>
              </div>

              {/* Main Headline */}
              <h1 className="text-5xl font-bold tracking-tight sm:text-6xl lg:text-7xl mb-6">
                <span className="text-foreground">Yii2 - Modern</span>
                <br />
                <span className="inline-block bg-gradient-to-r from-blue-500 via-purple-500 to-blue-500 bg-clip-text text-transparent">
                  Starter Kit
                </span>
              </h1>

              {/* Sub-headline */}
              <p className="mt-6 text-lg leading-8 text-muted-foreground sm:text-xl max-w-2xl mx-auto">
                Ship faster production-ready applications 10x faster with starter kit powered by Yii2, Inertia V2, and Shadcn/ui.
              </p>

              {/* CTA Buttons */}
              <div className="mt-10 flex items-center justify-center gap-x-4">
                <Button variant="default" className="px-8" asChild>
                  <Link href="/auth/register">View Demo</Link>
                </Button>
                <Button variant="outline" className="px-8" asChild>
                  <a href="https://github.com" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2">
                    <Github className="h-5 w-5" />
                    Github
                  </a>
                </Button>
              </div>
            </div>
          </div>
        </section>

        {/* Ready to Ship Section */}
        <section className="py-24 sm:py-32">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="mx-auto max-w-3xl text-center">
              <h2 className="text-3xl font-bold tracking-tight sm:text-4xl mb-6">
                Ready to ship faster?
              </h2>
              <p className="text-lg text-muted-foreground mb-4">
                You're already blazing fast with Yii2. This starter kit is about to make your shipping speed supersonic. 🚀
              </p>
              <div className="mb-8">
                <Button variant="default" size="lg" className="px-8" asChild>
                  <a href="https://github.com" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2">
                    <Github className="h-5 w-5" />
                    View on GitHub
                  </a>
                </Button>
              </div>

              {/* Code Block */}
              <CodeBlock />
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section id="features" className="py-24 sm:py-32 bg-muted/50">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="mx-auto max-w-2xl text-center">
              <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
                Everything you need to succeed
              </h2>
              <p className="mt-4 text-lg text-muted-foreground">
                Powerful features built right in, so you can focus on what matters most.
              </p>
            </div>
            <div className="mx-auto mt-16 grid max-w-2xl grid-cols-1 gap-6 sm:mt-20 lg:mx-0 lg:max-w-none lg:grid-cols-3 xl:grid-cols-4">
              {features.map((feature) => {
                const Icon = feature.icon
                return (
                  <Card key={feature.title} className="border-2 hover:border-primary/50 transition-colors cursor-default">
                    <CardHeader>
                      <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                        <Icon className="h-6 w-6 text-primary" />
                      </div>
                      <CardTitle>{feature.title}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <CardDescription>{feature.description}</CardDescription>
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="border-t py-12">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center">
              <p className="text-sm text-muted-foreground mb-6">
                Trusted by developers worldwide.
              </p>
              <div className="flex items-center justify-center gap-6 opacity-60 mb-8">
                <Rocket className="h-6 w-6 text-foreground" />
                <Zap className="h-6 w-6 text-foreground" />
                <Globe className="h-6 w-6 text-foreground" />
                <Shield className="h-6 w-6 text-foreground" />
              </div>
              <p className="text-sm text-muted-foreground">
                Built by
                {' '}
                <a
                  href="https://github.com/akshayjoshi"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-foreground hover:underline font-medium"
                >
                  Akshay Joshi
                </a>
                {' '}
                at
                {' '}
                <a
                  href="https://crenspire.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-foreground hover:underline font-medium"
                >
                  Crenspire Technologies
                </a>
              </p>
            </div>
          </div>
        </footer>
      </div>
    </>
  )
}
