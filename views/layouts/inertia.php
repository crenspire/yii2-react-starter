<?php

/** @var yii\web\View $this */
/** @var array $page Inertia page object */
/** @var Crenspire\Yii2Inertia\Ssr\SsrResponse|null $ssr Server-side rendered page, when SSR is enabled */

use Crenspire\Yii2Inertia\Inertia;
use yii\helpers\Html;

?>
<!DOCTYPE html>
<html lang="<?= Html::encode(Yii::$app->language) ?>">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title data-inertia>Yii2 - Modern Starter Kit</title>
    <link rel="icon" type="image/x-icon" href="<?= Html::encode(Yii::getAlias('@web/favicon.ico')) ?>">
    <?php // Vite dev server (with HMR) when VITE_DEV_SERVER is set in dev, otherwise the build in web/dist ?>
    <?= Inertia::vite()->tags('resources/js/app.jsx') ?>
    <?= Inertia::ssrHead($ssr) ?>
</head>
<body>
    <?= Inertia::app($page, $ssr) ?>
</body>
</html>
