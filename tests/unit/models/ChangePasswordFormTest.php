<?php

namespace tests\unit\models;

use app\models\ChangePasswordForm;
use app\models\User;
use UserFactory;

class ChangePasswordFormTest extends \Codeception\Test\Unit
{
    public function testRequiresCurrentPassword()
    {
        $form = new ChangePasswordForm(UserFactory::create(), [
            'current_password' => 'not-my-password',
            'password' => 'new-password-1',
            'password_confirm' => 'new-password-1',
        ]);

        verify($form->changePassword())->false();
        verify($form->errors)->arrayHasKey('current_password');
    }

    public function testRequiresMatchingConfirmation()
    {
        $form = new ChangePasswordForm(UserFactory::create(), [
            'current_password' => UserFactory::PASSWORD,
            'password' => 'new-password-1',
            'password_confirm' => 'new-password-2',
        ]);

        verify($form->changePassword())->false();
        verify($form->errors)->arrayHasKey('password_confirm');
    }

    public function testChangesPassword()
    {
        $user = UserFactory::create();
        $form = new ChangePasswordForm($user, [
            'current_password' => UserFactory::PASSWORD,
            'password' => 'new-password-1',
            'password_confirm' => 'new-password-1',
        ]);

        verify($form->changePassword())->true();
        verify(User::findOne($user->id)->validatePassword('new-password-1'))->true();
    }
}
