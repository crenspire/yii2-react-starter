# Troubleshooting

## Blank page or missing styles

- **Development:** check that the Vite dev server is running (`npm run dev`), `YII_ENV=dev` and `VITE_DEV_SERVER`
  points at it.
- **Production:** run `npm run build` and check that `web/dist/.vite/manifest.json` exists and is readable by the web
  server.
- Open the browser console. A JavaScript error in a page component stops that page from rendering.

## Forms fail with "Your session has expired"

The CSRF token is sent in an `XSRF-TOKEN` cookie. Cookies are shared between all ports of a host, so another app on
`127.0.0.1` (a Django or Laravel app, for example) can overwrite this cookie, and every form submission is rejected.

- Browse to `http://localhost:8080` instead of `http://127.0.0.1:8080` (or the other way around), or
- give the cookie a unique name in `config/web.php`:

  ```php
  'inertia' => [
      'class' => \Crenspire\Yii2Inertia\Manager::class,
      'csrfCookieName' => 'MYAPP-XSRF-TOKEN',
      'csrfHeaderName' => 'X-MYAPP-XSRF-TOKEN',
      // ...
  ],
  ```

  and the matching option in `resources/js/app.jsx`:

  ```js
  createInertiaApp({
    http: { xsrfCookieName: 'MYAPP-XSRF-TOKEN', xsrfHeaderName: 'X-MYAPP-XSRF-TOKEN' },
    // ...
  })
  ```

The message also appears when a session really expired; submitting the form again works.

## "Too many login attempts"

Sign-in is blocked for 15 minutes after 5 failures for the same email and IP address. Wait, or clear the cache:

```bash
php yii cache/flush-all
```

## Password reset emails don't arrive

With `MAILER_USE_FILE_TRANSPORT=true` (the default) emails are written to `runtime/mail` instead of being sent. Set
`MAILER_USE_FILE_TRANSPORT=false` and `MAILER_DSN` to send them.

## "No active user found" or no admin access

Create or promote an admin:

```bash
php yii seed/admin you@example.com
```

## Icons in buttons have the wrong size after running `eslint --fix`

The linter can escape quotes inside Tailwind class strings (`[class*=\'size-\']`), which Tailwind can't read. Use
double quotes inside those strings: `[class*="size-"]`. See [Frontend](frontend.md#components).

## Changes to `.env` have no effect

Real environment variables take precedence over `.env`. Check whether the variable is already set in your shell,
web server or container, and restart PHP-FPM or the PHP server after editing `.env`.

## Tests fail with "no such table"

The test bootstrap rebuilds the database from `migrations/`. Check that your new migration runs on SQLite, or run the
tests against MySQL with `TEST_DB_DSN` (see [Testing](testing.md#test-database)).
