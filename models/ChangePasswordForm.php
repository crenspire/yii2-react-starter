<?php

namespace app\models;

use yii\base\Model;

/**
 * Lets a signed-in user change their password.
 */
class ChangePasswordForm extends Model
{
    public $current_password;
    public $password;
    public $password_confirm;

    /**
     * @var User
     */
    private $_user;

    /**
     * @param User $user
     * @param array $config
     */
    public function __construct(User $user, $config = [])
    {
        $this->_user = $user;
        parent::__construct($config);
    }

    /**
     * {@inheritdoc}
     */
    public function rules()
    {
        return [
            [['current_password', 'password', 'password_confirm'], 'required'],
            ['current_password', 'validateCurrentPassword'],
            ['password', 'string', 'min' => 8, 'max' => 72],
            ['password_confirm', 'compare', 'compareAttribute' => 'password', 'message' => 'Passwords do not match.'],
        ];
    }

    /**
     * {@inheritdoc}
     */
    public function attributeLabels()
    {
        return [
            'current_password' => 'Current password',
            'password' => 'New password',
            'password_confirm' => 'Password confirmation',
        ];
    }

    /**
     * @param string $attribute
     */
    public function validateCurrentPassword($attribute)
    {
        if (!$this->_user->validatePassword($this->$attribute)) {
            $this->addError($attribute, 'The current password is incorrect.');
        }
    }

    /**
     * @return bool
     */
    public function changePassword()
    {
        if (!$this->validate()) {
            return false;
        }

        $this->_user->setPassword($this->password);

        return $this->_user->save(false);
    }

    /**
     * @return User
     */
    public function getUser()
    {
        return $this->_user;
    }
}
