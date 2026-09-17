<?php

use yii\helpers\ArrayHelper;

/**
 * Application configuration shared by all test types.
 * Based on the web configuration so tests exercise the real routing, error handling and Inertia setup.
 */
return ArrayHelper::merge(require __DIR__ . '/web.php', [
    'id' => 'basic-tests',
    'language' => 'en-US',
    'components' => [
        'db' => require __DIR__ . '/test_db.php',
        'cache' => [
            'class' => 'yii\caching\ArrayCache',
        ],
        // Fast password hashing keeps the suite quick
        'security' => [
            'passwordHashCost' => 4,
        ],
        'mailer' => [
            'useFileTransport' => true,
        ],
        'assetManager' => [
            'basePath' => __DIR__ . '/../web/assets',
        ],
        // Functional tests render pages without a frontend build
        'inertia' => [
            'vite' => ['throwOnMissingManifest' => false],
        ],
        'request' => [
            'cookieValidationKey' => 'test',
            'enableCsrfValidation' => false,
        ],
    ],
]);
