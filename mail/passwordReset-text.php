<?php

/** @var yii\web\View $this */
/** @var app\models\User $user */
/** @var string $resetLink */
?>
Hello <?= $user->name ?>,

We received a request to reset the password for your account. Follow the link below to choose a new password:

<?= $resetLink ?>


This link expires in <?= (int) ceil(Yii::$app->params['passwordResetTokenExpire'] / 60) ?> minutes.
If you didn't request a password reset, you can ignore this email.
