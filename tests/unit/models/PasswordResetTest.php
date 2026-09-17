<?php

namespace tests\unit\models;

use app\models\PasswordResetRequestForm;
use app\models\PasswordResetToken;
use app\models\ResetPasswordForm;
use app\models\User;
use UserFactory;

class PasswordResetTest extends \Codeception\Test\Unit
{
    /**
     * @var \UnitTester
     */
    protected $tester;

    public function testResetFlow()
    {
        $user = UserFactory::create(['email' => 'reset@example.com']);
        $oldAuthKey = $user->getAuthKey();

        verify((new PasswordResetRequestForm(['email' => 'reset@example.com']))->sendEmail())->true();
        $this->tester->seeEmailIsSent(1);
        $token = $this->grabTokenFromLastEmail();

        // Only the hash of the token is stored
        verify(PasswordResetToken::findOne(['email' => 'reset@example.com'])->token)->notEquals($token);

        $form = new ResetPasswordForm(['token' => $token, 'password' => 'brand-new-pass', 'password_confirm' => 'brand-new-pass']);
        verify($form->resetPassword())->true();

        $user = User::findOne($user->id);
        verify($user->validatePassword('brand-new-pass'))->true();
        verify($user->getAuthKey())->notEquals($oldAuthKey);

        // The token can't be used twice
        $again = new ResetPasswordForm(['token' => $token, 'password' => 'another-pass-1', 'password_confirm' => 'another-pass-1']);
        verify($again->resetPassword())->false();
        verify($again->errors)->arrayHasKey('token');
    }

    public function testUnknownEmailSucceedsWithoutSendingEmail()
    {
        verify((new PasswordResetRequestForm(['email' => 'nobody@example.com']))->sendEmail())->true();
        $this->tester->dontSeeEmailIsSent();
    }

    public function testRepeatedRequestsAreThrottled()
    {
        UserFactory::create(['email' => 'reset@example.com']);

        (new PasswordResetRequestForm(['email' => 'reset@example.com']))->sendEmail();
        (new PasswordResetRequestForm(['email' => 'reset@example.com']))->sendEmail();

        $this->tester->seeEmailIsSent(1);
    }

    public function testExpiredTokenIsRejected()
    {
        UserFactory::create(['email' => 'reset@example.com']);
        $token = PasswordResetToken::issue('reset@example.com');
        PasswordResetToken::updateAll(['created_at' => date('Y-m-d H:i:s', time() - 7200)], ['email' => 'reset@example.com']);

        $form = new ResetPasswordForm(['token' => $token, 'password' => 'brand-new-pass', 'password_confirm' => 'brand-new-pass']);
        verify($form->resetPassword())->false();
        verify($form->errors)->arrayHasKey('token');
    }

    private function grabTokenFromLastEmail()
    {
        /** @var \yii\mail\MessageInterface $email */
        $email = $this->tester->grabLastSentEmail();
        verify($email->getTo())->arrayHasKey('reset@example.com');
        preg_match('/token=([A-Za-z0-9_-]+)/', quoted_printable_decode($email->toString()), $matches);
        verify($matches)->arrayHasKey(1);

        return $matches[1];
    }
}
