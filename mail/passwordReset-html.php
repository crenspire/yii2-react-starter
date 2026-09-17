<?php

use yii\helpers\Html;

/** @var yii\web\View $this */
/** @var app\models\User $user */
/** @var string $resetLink */

$this->title = 'Reset your password';
?>
<div class="password-reset">
    <p>Hello <?= Html::encode($user->name) ?>,</p>

    <p>We received a request to reset the password for your account. Follow the link below to choose a new password:</p>

    <p><?= Html::a(Html::encode($resetLink), $resetLink) ?></p>

    <p>This link expires in <?= (int) ceil(Yii::$app->params['passwordResetTokenExpire'] / 60) ?> minutes.
        If you didn't request a password reset, you can ignore this email.</p>
</div>
