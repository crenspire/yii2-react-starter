<?php

/**
 * Loads environment variables from the project's `.env` file (if present)
 * and defines the `env()` helper used by the configuration files.
 *
 * Real environment variables always take precedence over `.env` values.
 */

require_once __DIR__ . '/../vendor/autoload.php';

// Existing variables are never overwritten, wherever the server exposes them. Values from .env
// are written to $_ENV and getenv() only (not $_SERVER), so they don't appear in Yii's request logs.
$repository = Dotenv\Repository\RepositoryBuilder::createWithNoAdapters()
    ->addReader(Dotenv\Repository\Adapter\ServerConstAdapter::class)
    ->addAdapter(Dotenv\Repository\Adapter\EnvConstAdapter::class)
    ->addAdapter(Dotenv\Repository\Adapter\PutenvAdapter::class)
    ->immutable()
    ->make();
Dotenv\Dotenv::create($repository, dirname(__DIR__))->safeLoad();

if (!function_exists('env')) {
    /**
     * Returns an environment variable, casting "true"/"false"/"null"/"" strings.
     *
     * @param string $key
     * @param mixed $default value returned when the variable is not set
     * @return mixed
     */
    function env(string $key, $default = null)
    {
        $value = $_SERVER[$key] ?? $_ENV[$key] ?? getenv($key);
        if ($value === false || $value === null) {
            return $default;
        }

        switch (strtolower((string) $value)) {
            case 'true':
                return true;
            case 'false':
                return false;
            case 'null':
                return null;
            case '':
                return $default;
        }

        return $value;
    }
}
