<?php

require __DIR__ . '/../config/env.php';

// Debug mode and environment come from .env (or real environment variables).
// Both default to production-safe values.
defined('YII_DEBUG') or define('YII_DEBUG', (bool) env('YII_DEBUG', false));
defined('YII_ENV') or define('YII_ENV', env('YII_ENV', 'prod'));

require __DIR__ . '/../vendor/yiisoft/yii2/Yii.php';

$config = require __DIR__ . '/../config/web.php';

(new yii\web\Application($config))->run();
