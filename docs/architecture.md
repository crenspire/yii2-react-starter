# Architecture

The starter kit is a classic server-side Yii 2 application whose views are React components.
[Inertia.js](https://inertiajs.com) connects the two: controllers return a page name and props, and the React app
renders it. There is no separate API layer and no client-side router to maintain.

## Request lifecycle

```
Browser ──► web/index.php ──► URL rule ──► Controller action
                                                   │
                                   Inertia::render('Users/Index', $props)
                                                   │
                ┌──────────────────────────────────┴───────────────────────────────┐
     first visit (full page load)                                   later visits (X-Inertia header)
     HTML from views/layouts/inertia.php                             JSON page object
     with the page object embedded                                   { component, props, url, version }
                └──────────────────────────────────┬───────────────────────────────┘
                                                   ▼
                          resources/js/app.jsx resolves resources/js/pages/Users/Index.jsx
                          and renders it with the props (inside its layout)
```

1. The first request loads the full HTML page. The page object (component name, props, URL, asset version) is
   embedded in it, and the React app boots from it.
2. Clicking an Inertia `<Link>` or submitting a form with `useForm` sends an XHR request with an `X-Inertia` header.
   The same controller action runs and returns the page object as JSON. Inertia swaps the page component without a
   full reload.
3. When the frontend build changes, the asset version changes, and Inertia forces a full page load so users get the
   new JavaScript.

## Directory structure

```
behaviors/             Model behaviors (soft deletes)
commands/              Console commands: seed/admin, user/set-role
components/            InertiaBootstrap (shared props) and InertiaErrorHandler
config/                Configuration (reads .env)
controllers/           Web controllers; all extend BaseController
docs/                  This documentation
mail/                  Email templates
migrations/            Database migrations
models/                ActiveRecord models and form models
resources/css/app.css  Tailwind CSS 4 entry point and theme variables
resources/js/
  app.jsx              Inertia app setup
  components/app/      Sidebar, navigation, user menu, site header
  components/layouts/  AppLayout (dashboard) and AuthLayout (sign-in pages)
  components/ui/       shadcn/ui components
  hooks/, lib/         Hooks and helpers (cn, date formatting, initials)
  pages/               One React component per Inertia page
tests/                 Codeception unit and functional tests
views/layouts/         inertia.php, the root HTML document
web/                   Document root: index.php, favicon, frontend build (web/dist)
```

## Controllers

Controllers extend `app\controllers\BaseController` and return Inertia responses:

```php
use Crenspire\Yii2Inertia\Inertia;

public function actionView($id)
{
    return Inertia::render('Users/View', [
        'user' => $this->findModel($id)->toArray(),
    ]);
}
```

Only pass the data the page needs. `User::fields()` limits what `toArray()` exposes, so the password hash and
remember-me token are never serialized.

`BaseController` adds:

| Method | Use it to |
| --- | --- |
| `inertiaRedirect($url)` | Redirect after a form submission (always `303`, with a `Location` header Inertia can follow) |
| `redirectBack()` | Return to the previous page on this site |
| `denyAccess()` | `denyCallback` for `AccessControl`: guests go to sign-in and come back afterwards, others get a 403 |
| `redirectIfAuthenticated()` | Keep signed-in users away from guest-only pages |

It also turns an expired CSRF token on an Inertia request into a redirect back with an error message, instead of an
error page.

Use `Inertia::location($url)` when the next page must be a full page load, for example after signing in or out.

## Shared props

`components/InertiaBootstrap.php` shares these props with every page:

| Prop | Value |
| --- | --- |
| `auth.user` | `{ id, name, email, role, isAdmin }` for the signed-in user, or `null` |
| `flash` | One-time messages set with `Yii::$app->session->setFlash()` |

Read them in any component with `usePage().props`. Add your own with `Inertia::share()`; use a closure so the value
is computed per request.

> [!NOTE]
> Props returned by a controller override shared props with the same name. That's why the signed-in user is shared
> as `auth.user`: a page can pass its own `user` prop (the user being edited, for example) without replacing it.

## Flash messages

Set a message before redirecting and it is shown as a toast on the next page:

```php
Yii::$app->session->setFlash('success', 'User created successfully.');
return $this->inertiaRedirect(['/user/index']);
```

The types `success`, `error`, `warning` and `info` map to the matching toast styles
(`resources/js/components/FlashMessages.jsx`).

## Validation errors

Form models and ActiveRecords validate on the server. Pass their errors in the `errors` prop and render the page
again; Inertia's `useForm` picks them up and keeps what the user typed:

```php
if ($model->load($this->request->getBodyParams(), '') && $model->save()) {
    Yii::$app->session->setFlash('success', 'Saved.');
    return $this->inertiaRedirect(['/project/index']);
}

return Inertia::render('Projects/Form', [
    'project' => $model->toArray(),
    'errors' => (object) $model->getFirstErrors(),
]);
```

`(object)` makes an empty error list serialize as `{}` rather than `[]`.

## Error pages

`components/InertiaErrorHandler.php` renders HTTP errors (403, 404, 500, …) with the React `Error` page. Messages of
4xx exceptions are shown to the user, so write them for users (`'The requested user does not exist.'`). Server errors
show a generic message.

With `YII_DEBUG=true`, unexpected exceptions still show Yii's detailed error page.

## Security measures

- **CSRF:** the Inertia component sets an `XSRF-TOKEN` cookie, and the client sends it back in an `X-XSRF-TOKEN`
  header on every non-GET request. Yii validates it as usual.
- **Mass assignment:** `User::scenarios()` lists the only attributes `load()` may set in each scenario.
- **Cookies:** the session, identity and Yii CSRF cookies are `HttpOnly` and `SameSite=Lax`. The `XSRF-TOKEN` cookie
  must be readable by JavaScript, which is safe because other sites can't read it.
- **Logs:** credentials passed as server variables are masked in error logs.

See [Authentication and roles](authentication.md) for sign-in security.
