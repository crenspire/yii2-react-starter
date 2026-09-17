# Frontend

The frontend is React 19 with [Inertia.js](https://inertiajs.com) v3, [shadcn/ui](https://ui.shadcn.com) components,
Tailwind CSS 4, [lucide](https://lucide.dev) icons and the Geist font, built with Vite.

## Pages

Every Inertia page is a React component in `resources/js/pages`. The name passed to `Inertia::render()` is its path
without the extension:

| `Inertia::render(...)` | File |
| --- | --- |
| `'Dashboard/Index'` | `resources/js/pages/Dashboard/Index.jsx` |
| `'Users/Form'` | `resources/js/pages/Users/Form.jsx` |

Pages are code-split: each one is downloaded the first time it's visited. Unknown page names render `Error.jsx`.

Props passed from the controller arrive as component props. Shared props (`auth.user`, `flash`) are available
through `usePage().props`.

## Layouts

### Dashboard layout

`AppLayout` provides the sidebar, the header with breadcrumbs and the page container. Attach it as a **persistent
layout** so it stays mounted between visits; the sidebar keeps its state and doesn't re-render on every navigation:

```jsx
import { Head } from '@inertiajs/react'
import AppLayout from '@/components/layouts/AppLayout'
import { PageHeader } from '@/components/page-header'

export default function Reports() {
  return (
    <>
      <Head title="Reports" />
      <PageHeader title="Reports" description="Monthly usage reports." />
      {/* page content */}
    </>
  )
}

Reports.layout = page => (
  <AppLayout breadcrumbs={[{ title: 'Dashboard', href: '/dashboard' }, { title: 'Reports' }]}>{page}</AppLayout>
)
```

Breadcrumbs can use the page's props, for example `page.props.project.name`.

The content area is a [container query](https://tailwindcss.com/docs/responsive-design#container-queries) named
`main`, so cards can respond to the space next to the sidebar with `@xl/main:grid-cols-2`, `@5xl/main:grid-cols-4`
and so on.

### Sidebar navigation

Edit `resources/js/components/app/app-sidebar.jsx` to add links. Each group is a list of
`{ title, href, icon, isActive }` items:

```jsx
const platform = [
  { title: 'Dashboard', href: '/dashboard', icon: LayoutDashboard, isActive: path === '/dashboard' },
  { title: 'Reports', href: '/reports', icon: ChartColumn, isActive: path.startsWith('/reports') },
]
```

The sidebar collapses to icons (tooltips show the titles) and becomes a sheet on mobile. The collapsed state is
remembered in the `sidebar_state` cookie.

### Auth layout

`AuthLayout` is the two-column layout of the sign-in pages: the form on the left and a brand panel on the right
(hidden on small screens). It takes `title`, `description` and `footer` props. Edit the panel's text in
`resources/js/components/layouts/AuthLayout.jsx`.

## Components

`resources/js/components/ui` contains [shadcn/ui](https://ui.shadcn.com/docs/components) components (new-york style).
You own this code: change it freely.

Add more with the shadcn CLI:

```bash
npx shadcn@latest add calendar
```

> [!WARNING]
> Check the result of the CLI before committing:
>
> - It may write `import { cn } from "cn"`. Change it to `import { cn } from "@/lib/utils"`.
> - Don't let `eslint --fix` turn `[class*='size-']` into `[class*=\'size-\']` inside class strings. Tailwind reads
>   the raw source, so escaped quotes silently break those styles. Use double quotes inside the string:
>   `'[&_svg:not([class*="size-"])]:size-4'`.

Application components live next to them:

| Component | Purpose |
| --- | --- |
| `components/page-header.jsx` | Title, description and action buttons at the top of a page |
| `components/FormField.jsx` | Label, control, help text and validation error |
| `components/app-logo.jsx` | The brand mark |
| `components/ThemeToggle.jsx` | Light/dark toggle button |
| `components/FlashMessages.jsx` | Shows server flash messages as toasts |
| `components/app/*` | Sidebar, navigation groups, user menu, site header |

## Forms

Use Inertia's `useForm` with `FormField`. Validation happens on the server; errors come back in `errors`:

```jsx
import { useForm } from '@inertiajs/react'
import { Loader2 } from 'lucide-react'
import { FormField } from '@/components/FormField'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

export default function ProjectForm({ project }) {
  const { data, setData, post, processing, errors } = useForm({
    name: project?.name ?? '',
  })

  const submit = (e) => {
    e.preventDefault()
    post('/projects/create')
  }

  return (
    <form onSubmit={submit} className="grid gap-6">
      <FormField id="name" label="Name" error={errors.name}>
        <Input
          id="name"
          value={data.name}
          onChange={e => setData('name', e.target.value)}
          aria-invalid={!!errors.name}
        />
      </FormField>
      <Button type="submit" disabled={processing}>
        {processing && <Loader2 className="animate-spin" />}
        Save
      </Button>
    </form>
  )
}
```

`aria-invalid` gives the input its error styling. CSRF protection is automatic: Inertia sends the token with every
request.

## Theming

Colors, radii and fonts are CSS variables in `resources/css/app.css`, in the format used by shadcn/ui. Generate a new
palette with the [shadcn theme editor](https://ui.shadcn.com/themes) and replace the `:root` and `.dark` blocks.

The theme follows the operating system by default. Users can switch between light, dark and system in the user menu or
on the Settings page ([next-themes](https://github.com/pacocoursey/next-themes)).

To replace the logo, swap `web/logo-light.png` (shown on dark backgrounds) and `web/logo-dark.png`, or edit
`components/app-logo.jsx`.

## Charts

Charts use [shadcn/ui charts](https://ui.shadcn.com/charts), built on Recharts. See the sign-ups chart in
`pages/Dashboard/Index.jsx` for an example with `ChartContainer` and `ChartTooltip`.

## Helpers

`resources/js/lib/format.js` has `initials()`, `formatDate()`, `formatDateTime()` and `formatRelative()`
(e.g. "3 days ago") for the `Y-m-d H:i:s` timestamps the database returns.

## Linting

```bash
npm run lint
npm run lint:fix
```

The configuration is [@antfu/eslint-config](https://github.com/antfu/eslint-config) with React rules.
