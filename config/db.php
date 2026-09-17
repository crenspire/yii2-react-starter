<?php

return [
    'class' => 'yii\db\Connection',
    'dsn' => env('DB_DSN', 'mysql:host=localhost;dbname=yii2basic'),
    'username' => env('DB_USERNAME', 'root'),
    'password' => env('DB_PASSWORD', ''),
    'charset' => 'utf8mb4',

    // Cache table schemas outside of development
    'enableSchemaCache' => !YII_ENV_DEV,
    'schemaCacheDuration' => 3600,
    'schemaCache' => 'cache',
];
