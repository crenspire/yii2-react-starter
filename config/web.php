<?php

$params = require __DIR__ . '/params.php';
$db = require __DIR__ . '/db.php';

$mailer = [
    'class' => \yii\symfonymailer\Mailer::class,
    'viewPath' => '@app/mail',
    // Write emails to runtime/mail instead of sending them
    'useFileTransport' => (bool) env('MAILER_USE_FILE_TRANSPORT', true),
];
if (env('MAILER_DSN')) {
    $mailer['transport'] = ['dsn' => env('MAILER_DSN')];
}

$config = [
    'id' => 'basic',
    'basePath' => dirname(__DIR__),
    'bootstrap' => ['log', \app\components\InertiaBootstrap::class],
    'aliases' => [
        '@bower' => '@vendor/bower-asset',
        '@npm'   => '@vendor/npm-asset',
    ],
    'components' => [
        'request' => [
            'cookieValidationKey' => env('COOKIE_VALIDATION_KEY'),
            'csrfCookie' => ['httpOnly' => true, 'sameSite' => 'Lax'],
        ],
        'session' => [
            'cookieParams' => ['httponly' => true, 'samesite' => 'Lax'],
        ],
        'cache' => [
            'class' => 'yii\caching\FileCache',
        ],
        'user' => [
            'identityClass' => 'app\models\User',
            'enableAutoLogin' => true,
            'loginUrl' => ['/auth/login'],
            'identityCookie' => ['name' => '_identity', 'httpOnly' => true, 'sameSite' => 'Lax'],
        ],
        'inertia' => [
            'class' => \Crenspire\Yii2Inertia\Manager::class,
            'vite' => [
                'devServerUrl' => YII_ENV_DEV ? (env('VITE_DEV_SERVER') ?: null) : null,
                'reactRefresh' => true,
            ],
        ],
        'errorHandler' => [
            'class' => \app\components\InertiaErrorHandler::class,
        ],
        'mailer' => $mailer,
        'log' => [
            'traceLevel' => YII_DEBUG ? 3 : 0,
            'targets' => [
                [
                    'class' => 'yii\log\FileTarget',
                    'levels' => ['error', 'warning'],
                    // Never write credentials passed to PHP as server variables into the logs
                    'maskVars' => [
                        '_SERVER.HTTP_AUTHORIZATION',
                        '_SERVER.PHP_AUTH_USER',
                        '_SERVER.PHP_AUTH_PW',
                        '_SERVER.DB_PASSWORD',
                        '_SERVER.TEST_DB_PASSWORD',
                        '_SERVER.COOKIE_VALIDATION_KEY',
                        '_SERVER.MAILER_DSN',
                    ],
                ],
            ],
        ],
        'db' => $db,
        'urlManager' => [
            'enablePrettyUrl' => true,
            'showScriptName' => false,
            'rules' => [
                '' => 'home/index',
                'dashboard' => 'dashboard/index',
                'dashboard/<action:[\w-]+>' => 'dashboard/<action>',
                'users' => 'user/index',
                'users/create' => 'user/create',
                'users/<id:\d+>' => 'user/view',
                'users/<id:\d+>/edit' => 'user/update',
                'users/<id:\d+>/delete' => 'user/delete',
            ],
        ],
    ],
    'params' => $params,
];

if (YII_ENV_DEV) {
    // configuration adjustments for 'dev' environment
    $config['bootstrap'][] = 'debug';
    $config['modules']['debug'] = [
        'class' => 'yii\debug\Module',
        // uncomment the following to add your IP if you are not connecting from localhost.
        //'allowedIPs' => ['127.0.0.1', '::1'],
    ];

    $config['bootstrap'][] = 'gii';
    $config['modules']['gii'] = [
        'class' => 'yii\gii\Module',
        // uncomment the following to add your IP if you are not connecting from localhost.
        //'allowedIPs' => ['127.0.0.1', '::1'],
    ];
}

return $config;
