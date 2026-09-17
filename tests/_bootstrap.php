<?php

require __DIR__ . '/../config/env.php';

define('YII_ENV', 'test');
defined('YII_DEBUG') or define('YII_DEBUG', true);

require_once __DIR__ . '/../vendor/yiisoft/yii2/Yii.php';
require_once __DIR__ . '/_support/UserFactory.php';

/*
 * Rebuild the test database schema from the migrations before the suite runs.
 * Each test then runs inside a transaction that the Yii2 module rolls back.
 */
(static function () {
    /** @var yii\db\Connection $db */
    // No application exists yet, so the connection can't use the app's schema cache
    $db = Yii::createObject(['schemaCache' => null] + require __DIR__ . '/../config/test_db.php');

    foreach ($db->getSchema()->getTableNames('', true) as $table) {
        $db->createCommand()->dropTable($table)->execute();
    }
    $db->getSchema()->refresh();

    $migrations = glob(__DIR__ . '/../migrations/m*.php');
    sort($migrations);
    ob_start();
    foreach ($migrations as $file) {
        require_once $file;
        $class = basename($file, '.php');
        (new $class(['db' => $db, 'compact' => true]))->up();
    }
    ob_end_clean();

    $db->close();
})();
