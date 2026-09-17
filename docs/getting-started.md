# Getting started

## Requirements

- PHP 8.2 or newer with the `pdo_mysql`, `mbstring` and `intl` extensions (`pdo_sqlite` to run the tests)
- [Composer](https://getcomposer.org/)
- Node.js 22 or newer, and npm
- MySQL 5.7+ or MariaDB 10.3+

## Installation

```bash
git clone git@github.com:crenspire/yii2-react-starter.git my-app
cd my-app
composer install
npm install
```

### Configure the environment

Settings that differ between environments, including secrets, live in a `.env` file that is not committed:

```bash
cp .env.example .env
php -r "echo bin2hex(random_bytes(32)), PHP_EOL;"
```

Paste the generated value into `COOKIE_VALIDATION_KEY`, then set the database connection:

```dotenv
DB_DSN="mysql:host=localhost;dbname=yii2basic"
DB_USERNAME=root
DB_PASSWORD=secret
```

See [Configuration](configuration.md) for every variable.

### Create the database

```sql
CREATE DATABASE yii2basic CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

```bash
php yii migrate
```

### Create an admin user

```bash
php yii seed/admin admin@example.com
```

A random password is generated and printed. Pass a second argument to choose it yourself. Running the command for
an existing account grants that account the admin role.

## Run the application

```bash
npm run serve
```

This starts the PHP server (`php yii serve`, port 8080) and the Vite dev server (port 5173) together, with hot module
replacement for the React code. Open **http://localhost:8080** and sign in.

You can also run them in separate terminals with `php yii serve` and `npm run dev`.

> [!TIP]
> Browse to `localhost` rather than `127.0.0.1` if other apps on your machine set an `XSRF-TOKEN` cookie.
> See [Troubleshooting](troubleshooting.md#forms-fail-with-your-session-has-expired).

## Useful commands

| Command | Description |
| --- | --- |
| `npm run serve` | PHP and Vite dev servers together |
| `npm run build` | Production build of the frontend into `web/dist` |
| `npm run lint` / `npm run lint:fix` | ESLint for the frontend |
| `vendor/bin/codecept run` | Unit and functional tests |
| `php yii migrate` | Apply database migrations |
| `php yii seed/admin <email> [password]` | Create an admin, or promote an existing user |
| `php yii user/set-role <email> <admin\|user>` | Change a user's role |

## Next steps

- Read [Architecture](architecture.md) to see how controllers and React pages fit together.
- Follow [Building a feature](building-a-feature.md) to add your first page.
