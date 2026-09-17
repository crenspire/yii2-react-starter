<?php

namespace app\models;

use Yii;
use yii\base\Model;

/**
 * LoginForm is the model behind the login form.
 *
 * Failed attempts are throttled per email + IP address, and the error message never reveals
 * whether an account exists for the given email.
 *
 * @property-read User|null $user
 */
class LoginForm extends Model
{
    /**
     * A valid bcrypt hash of a random string. Checked when the email is unknown so that
     * response times don't reveal which accounts exist.
     */
    private const DUMMY_HASH = '$2y$13$b0JbeSncGub/7u/AUbQkSeX97PoPbwM3wvQ5YM5L38gNJzM3Jw3SS';

    public $email;
    public $password;
    public $rememberMe = false;

    private $_user = false;


    /**
     * @return array the validation rules.
     */
    public function rules()
    {
        return [
            ['email', 'trim'],
            [['email', 'password'], 'required'],
            ['email', 'email'],
            ['rememberMe', 'boolean'],
            ['email', 'validateNotThrottled'],
            ['password', 'validatePassword'],
        ];
    }

    /**
     * Blocks the attempt when too many recent logins failed for this email and IP.
     *
     * @param string $attribute
     */
    public function validateNotThrottled($attribute)
    {
        if ($this->hasErrors()) {
            return;
        }
        $attempts = (int) Yii::$app->cache->get($this->throttleKey());
        if ($attempts >= Yii::$app->params['loginMaxAttempts']) {
            $minutes = (int) ceil(Yii::$app->params['loginLockoutDuration'] / 60);
            $this->addError($attribute, "Too many login attempts. Please try again in {$minutes} minutes.");
        }
    }

    /**
     * Validates the password.
     * This method serves as the inline validation for password.
     *
     * @param string $attribute the attribute currently being validated
     */
    public function validatePassword($attribute)
    {
        if ($this->hasErrors()) {
            return;
        }

        $user = $this->getUser();
        if ($user === null) {
            // Spend the same time hashing as for a real account
            Yii::$app->security->validatePassword((string) $this->password, self::DUMMY_HASH);
        }

        if ($user === null || !$user->validatePassword($this->password)) {
            $this->recordFailedAttempt();
            $this->addError($attribute, 'Incorrect email or password.');
        }
    }

    /**
     * Logs in a user using the provided email and password.
     * @return bool whether the user is logged in successfully
     */
    public function login()
    {
        if (!$this->validate()) {
            return false;
        }

        Yii::$app->cache->delete($this->throttleKey());
        $duration = $this->rememberMe ? Yii::$app->params['rememberMeDuration'] : 0;

        return Yii::$app->user->login($this->getUser(), $duration);
    }

    /**
     * Finds user by [[email]]
     *
     * @return User|null
     */
    public function getUser()
    {
        if ($this->_user === false) {
            $this->_user = User::findByEmail($this->email);
        }

        return $this->_user;
    }

    private function recordFailedAttempt()
    {
        $key = $this->throttleKey();
        $attempts = (int) Yii::$app->cache->get($key);
        Yii::$app->cache->set($key, $attempts + 1, Yii::$app->params['loginLockoutDuration']);
    }

    private function throttleKey()
    {
        $ip = Yii::$app->request instanceof \yii\web\Request ? Yii::$app->request->userIP : 'cli';
        return ['login-attempts', mb_strtolower((string) $this->email), $ip];
    }
}
