# Configuration

## Environment variables

Configuration files read their values from environment variables. For local development these come from `.env`,
loaded by [phpdotenv](https://github.com/vlucas/phpdotenv) in `config/env.php`. **Real environment variables always
take precedence over `.env`**, so in production you can set them in your server, container or hosting platform and skip
the file entirely.

Values from `.env` are never copied into `$_SERVER`, so they don't appear in Yii's error logs.

| Variable | Default | Description |
| --- | --- | --- |
| `YII_ENV` | `prod` | `dev`, `test` or `prod` |
| `YII_DEBUG` | `false` | Detailed error pages and the debug toolbar |
| `COOKIE_VALIDATION_KEY` | — | **Required.** Secret used to sign cookies |
| `DB_DSN` | `mysql:host=localhost;dbname=yii2basic` | PDO connection string |
| `DB_USERNAME` | `root` | Database user |
| `DB_PASSWORD` | empty | Database password |
| `TEST_DB_DSN` | SQLite file in `runtime/` | Database for the test suite |
| `MAILER_USE_FILE_TRANSPORT` | `true` | Write emails to `runtime/mail` instead of sending them |
| `MAILER_DSN` | — | Symfony Mailer DSN, e.g. `smtp://user:pass@smtp.example.com:587` |
| `ADMIN_EMAIL` | `admin@example.com` | Available as `Yii::$app->params['adminEmail']` |
| `SENDER_EMAIL` | `noreply@example.com` | From address for emails |
| `SENDER_NAME` | `Yii2 Starter` | From name for emails |
| `VITE_DEV_SERVER` | — | Vite dev server URL, used only when `YII_ENV=dev` |

Read variables in your own configuration with the `env()` helper, which converts `"true"`, `"false"` and `"null"`:

```php
'someFeatureEnabled' => env('SOME_FEATURE_ENABLED', false),
```

## Configuration files

| File | Purpose |
| --- | --- |
| `config/env.php` | Loads `.env` and defines `env()` |
| `config/web.php` | Web application: components, URL rules, the `inertia` component, logging |
| `config/console.php` | Console commands (`php yii ...`) |
| `config/db.php` | Database connection |
| `config/params.php` | Application parameters (see below) |
| `config/test.php` | Test application, based on `web.php` |
| `config/test_db.php` | Test database connection |

### Application parameters

`config/params.php` holds values you may want to tune:

| Parameter | Default | Description |
| --- | --- | --- |
| `passwordResetTokenExpire` | `3600` | Seconds a password reset link stays valid |
| `passwordResetThrottle` | `60` | Minimum seconds between two reset emails for the same address |
| `loginMaxAttempts` | `5` | Failed sign-ins allowed per email and IP address… |
| `loginLockoutDuration` | `900` | …within this many seconds |
| `rememberMeDuration` | 30 days | Lifetime of the "Keep me signed in" cookie |

## Email

In development emails are saved as `.eml` files in `runtime/mail`, where you can open them to follow password reset
links. To send real email:

```dotenv
MAILER_USE_FILE_TRANSPORT=false
MAILER_DSN="smtp://user:pass@smtp.example.com:587"
SENDER_EMAIL=noreply@your-domain.com
```

Email templates are in `mail/`.

## Frontend assets

The root view `views/layouts/inertia.php` asks the `inertia` component for the script and style tags:

- In development (`YII_ENV=dev`) with `VITE_DEV_SERVER` set, pages load from the Vite dev server with hot module
  replacement. Run `npm run dev`.
- Otherwise the production build in `web/dist` is used, found through its Vite manifest. Run `npm run build`.

To use a production build locally, leave `VITE_DEV_SERVER` empty and run `npm run build`.

The component's options (Vite, SSR, CSRF cookie names, history encryption) are described in the
[adapter configuration reference](https://crenspire.github.io/yii2-inertia/reference/configuration).
