<?php

namespace app\models;

use Yii;
use yii\base\Model;
use yii\helpers\Url;

/**
 * Handles "forgot password" requests.
 *
 * The outcome is the same whether or not an account exists, so the form cannot be used to
 * discover registered email addresses.
 */
class PasswordResetRequestForm extends Model
{
    public $email;

    /**
     * {@inheritdoc}
     */
    public function rules()
    {
        return [
            ['email', 'trim'],
            ['email', 'required'],
            ['email', 'email'],
        ];
    }

    /**
     * Sends a password reset link if an account exists for the email.
     *
     * @return bool false only when validation fails
     */
    public function sendEmail()
    {
        if (!$this->validate()) {
            return false;
        }

        $user = User::findByEmail($this->email);
        if ($user === null) {
            return true;
        }

        // Don't send another email if one was sent moments ago
        $existing = PasswordResetToken::findOne(['email' => $user->email]);
        if ($existing && $existing->ageInSeconds() < Yii::$app->params['passwordResetThrottle']) {
            return true;
        }

        $token = PasswordResetToken::issue($user->email);
        $resetLink = Url::to(['/auth/reset-password', 'token' => $token], true);

        $sent = Yii::$app->mailer
            ->compose(['html' => 'passwordReset-html', 'text' => 'passwordReset-text'], [
                'user' => $user,
                'resetLink' => $resetLink,
            ])
            ->setFrom([Yii::$app->params['senderEmail'] => Yii::$app->params['senderName']])
            ->setTo($user->email)
            ->setSubject('Reset your password')
            ->send();

        if (!$sent) {
            Yii::error("Failed to send password reset email to user #{$user->id}", __METHOD__);
        }

        return true;
    }
}
