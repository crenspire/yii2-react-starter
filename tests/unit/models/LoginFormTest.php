<?php

namespace tests\unit\models;

use app\models\LoginForm;
use UserFactory;
use Yii;

class LoginFormTest extends \Codeception\Test\Unit
{
    protected function _after()
    {
        Yii::$app->user->logout();
    }

    public function testLoginCorrect()
    {
        $user = UserFactory::create(['email' => 'demo@example.com']);
        $model = new LoginForm(['email' => 'Demo@Example.com ', 'password' => UserFactory::PASSWORD]);

        verify($model->login())->true();
        verify(Yii::$app->user->id)->equals($user->id);
    }

    public function testUnknownEmailAndWrongPasswordGiveTheSameError()
    {
        UserFactory::create(['email' => 'demo@example.com']);

        $unknown = new LoginForm(['email' => 'nobody@example.com', 'password' => 'whatever']);
        $wrongPassword = new LoginForm(['email' => 'demo@example.com', 'password' => 'wrong_password']);

        verify($unknown->login())->false();
        verify($wrongPassword->login())->false();
        verify($unknown->errors)->equals($wrongPassword->errors);
        verify(Yii::$app->user->isGuest)->true();
    }

    public function testLoginIsThrottledAfterRepeatedFailures()
    {
        UserFactory::create(['email' => 'demo@example.com']);

        for ($i = 0; $i < Yii::$app->params['loginMaxAttempts']; $i++) {
            verify((new LoginForm(['email' => 'demo@example.com', 'password' => 'wrong']))->login())->false();
        }

        $model = new LoginForm(['email' => 'demo@example.com', 'password' => UserFactory::PASSWORD]);
        verify($model->login())->false();
        verify($model->getFirstError('email'))->stringContainsString('Too many login attempts');
        verify(Yii::$app->user->isGuest)->true();
    }

    public function testSoftDeletedUserCannotLogin()
    {
        $user = UserFactory::create(['email' => 'demo@example.com']);
        $user->trash();

        verify((new LoginForm(['email' => 'demo@example.com', 'password' => UserFactory::PASSWORD]))->login())->false();
    }
}
