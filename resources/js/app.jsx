import { createInertiaApp } from '@inertiajs/react'
import { createRoot } from 'react-dom/client'
import ErrorBoundary from './components/ErrorBoundary'
import { FlashMessages } from './components/FlashMessages'
import { ThemeProvider } from './components/ThemeProvider'
import { Toaster } from './components/ui/sonner'
import '../css/app.css'

// Pages are code-split: each one is loaded the first time it is visited
const pages = import.meta.glob('./pages/**/*.jsx')

createInertiaApp({
  resolve: async (name) => {
    const load = pages[`./pages/${name}.jsx`] || pages['./pages/Error.jsx']
    return (await load()).default
  },
  title: title => title ? `${title} | Yii2 Starter` : 'Yii2 Starter',
  progress: {
    color: 'var(--primary)',
    delay: 150,
  },
  setup({ el, App, props }) {
    createRoot(el).render(
      <ErrorBoundary>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
          <App {...props}>
            {({ Component, props: pageProps, key }) => {
              const page = <Component key={key} {...pageProps} />
              return (
                <>
                  {/* Pages can define a persistent layout that stays mounted between visits */}
                  {typeof Component.layout === 'function' ? Component.layout(page) : page}
                  <FlashMessages />
                </>
              )
            }}
          </App>
          <Toaster position="top-right" />
        </ThemeProvider>
      </ErrorBoundary>,
    )
  },
})
