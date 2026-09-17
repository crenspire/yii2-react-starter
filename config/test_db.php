<?php

// Test database. Defaults to a SQLite file so the suite runs without a database server.
// Never point this at a development or production database: tests create and wipe data.
return [
    'class' => 'yii\db\Connection',
    'dsn' => env('TEST_DB_DSN', 'sqlite:' . dirname(__DIR__) . '/runtime/test.sqlite'),
    'username' => env('TEST_DB_USERNAME', ''),
    'password' => env('TEST_DB_PASSWORD', ''),
    'charset' => 'utf8mb4',
];
