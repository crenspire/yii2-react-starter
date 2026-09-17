<?php

namespace app\models;

use yii\base\Model;

/**
 * Sets a new password using a token from a password reset email.
 */
class ResetPasswordForm extends Model
{
    public $token;
    public $password;
    public $password_confirm;

    /**
     * {@inheritdoc}
     */
    public function rules()
    {
        return [
            [['token', 'password', 'password_confirm'], 'required'],
            ['password', 'string', 'min' => 8, 'max' => 72],
            ['password_confirm', 'compare', 'compareAttribute' => 'password', 'message' => 'Passwords do not match.'],
            ['token', 'validateToken'],
        ];
    }

    /**
     * {@inheritdoc}
     */
    public function attributeLabels()
    {
        return [
            'password' => 'New password',
            'password_confirm' => 'Password confirmation',
        ];
    }

    /**
     * @param string $attribute
     */
    public function validateToken($attribute)
    {
        if ($this->findUser() === null) {
            $this->addError($attribute, 'This password reset link is invalid or has expired.');
        }
    }

    /**
     * Resets the password and consumes the token.
     *
     * @return bool
     */
    public function resetPassword()
    {
        if (!$this->validate()) {
            return false;
        }

        $user = $this->findUser();
        $user->setPassword($this->password);
        if (!$user->save(false)) {
            return false;
        }

        PasswordResetToken::deleteAll(['email' => $user->email]);

        return true;
    }

    /**
     * @return User|null the user the token belongs to
     */
    private function findUser()
    {
        $record = PasswordResetToken::findValid($this->token);

        return $record ? User::findByEmail($record->email) : null;
    }
}
