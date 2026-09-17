<?php

namespace app\models;

use Yii;
use yii\db\ActiveRecord;

/**
 * PasswordResetToken model
 *
 * Only a SHA-256 hash of the token is stored, so a leaked database cannot be used to reset passwords.
 * There is at most one token per email address.
 *
 * @property string $email
 * @property string $token SHA-256 hash of the token sent by email
 * @property string $created_at
 */
class PasswordResetToken extends ActiveRecord
{
    /**
     * {@inheritdoc}
     */
    public static function tableName()
    {
        return '{{%password_reset_tokens}}';
    }

    /**
     * {@inheritdoc}
     */
    public static function primaryKey()
    {
        return ['email'];
    }

    /**
     * Creates (or replaces) the reset token for an email address.
     *
     * @param string $email
     * @return string the plain-text token to send to the user
     */
    public static function issue($email)
    {
        static::deleteAll(['email' => $email]);

        $plainToken = Yii::$app->security->generateRandomString(64);
        $record = new static([
            'email' => $email,
            'token' => static::hashToken($plainToken),
            'created_at' => date('Y-m-d H:i:s'),
        ]);
        $record->save(false);

        return $plainToken;
    }

    /**
     * Finds a non-expired token record by the plain-text token from the reset link.
     *
     * @param string|null $plainToken
     * @return static|null
     */
    public static function findValid($plainToken)
    {
        if (!is_string($plainToken) || $plainToken === '') {
            return null;
        }
        $record = static::findOne(['token' => static::hashToken($plainToken)]);

        return $record && !$record->isExpired() ? $record : null;
    }

    /**
     * @param string $plainToken
     * @return string
     */
    public static function hashToken($plainToken)
    {
        return hash('sha256', $plainToken);
    }

    /**
     * @return bool whether the token is older than the configured lifetime
     */
    public function isExpired()
    {
        return $this->ageInSeconds() > Yii::$app->params['passwordResetTokenExpire'];
    }

    /**
     * @return int seconds since the token was issued
     */
    public function ageInSeconds()
    {
        $created = $this->created_at ? strtotime($this->created_at) : false;
        return $created === false ? PHP_INT_MAX : time() - $created;
    }
}
