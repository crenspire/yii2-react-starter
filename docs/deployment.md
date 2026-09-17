# Deployment

## Checklist

1. **Environment.** Set these as real environment variables (or in a `.env` file that is never committed):
   - `YII_ENV=prod` and `YII_DEBUG=false` (the defaults when unset)
   - `COOKIE_VALIDATION_KEY`, a new random value per environment
   - `DB_DSN`, `DB_USERNAME`, `DB_PASSWORD`
   - `MAILER_USE_FILE_TRANSPORT=false`, `MAILER_DSN`, `SENDER_EMAIL`
2. **Install dependencies and build the frontend:**

   ```bash
   composer install --no-dev --optimize-autoloader
   npm ci
   npm run build
   ```

3. **Migrate the database:**

   ```bash
   php yii migrate --interactive=0
   ```

4. **Create the first admin** (once): `php yii seed/admin you@example.com`.
5. **Permissions.** The web server user needs write access to `runtime/` and `web/assets/`.
6. **Document root.** Point the web server at `web/`, never at the project root.
7. **HTTPS.** Serve the application over HTTPS only.

The frontend build (`web/dist`) is not committed. Build it during deployment, or in CI and ship the result. After a
deploy with new assets, open browser tabs reload automatically on their next visit.

## Nginx

```nginx
server {
    listen 80;
    server_name example.com;
    root /var/www/app/web;
    index index.php;

    location / {
        try_files $uri $uri/ /index.php$is_args$args;
    }

    location ~ \.php$ {
        include fastcgi_params;
        fastcgi_param SCRIPT_FILENAME $realpath_root$fastcgi_script_name;
        fastcgi_pass unix:/run/php/php8.3-fpm.sock;
    }

    # Built assets have content hashes in their names and can be cached forever
    location /dist/assets/ {
        expires max;
        access_log off;
    }

    location ~ /\.(?!well-known) {
        deny all;
    }
}
```

## Apache

`web/.htaccess` routes requests to `index.php`. Enable `mod_rewrite` and set `DocumentRoot` to the `web/` directory
with `AllowOverride All`.

## Docker

`docker-compose.yml` runs the application with PHP 8.3 and Apache, plus MySQL 8:

```bash
cp .env.example .env    # set COOKIE_VALIDATION_KEY
npm install && npm run build
docker compose up -d
docker compose exec php composer install
docker compose exec php php yii migrate --interactive=0
docker compose exec php php yii seed/admin admin@example.com
```

The application is available at http://localhost:8000. The compose file sets the database variables for the
container, which take precedence over `.env`.

## Server-side rendering

Server-side rendering is optional. See the [SSR guide](https://crenspire.github.io/yii2-inertia/guide/ssr) of the
Inertia adapter.
