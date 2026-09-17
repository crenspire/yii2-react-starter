<?php

use app\models\User;

class AuthCest
{
    public function registrationIgnoresProtectedFields(FunctionalTester $I)
    {
        $I->sendAjaxPostRequest('/auth/register', [
            'name' => 'New User',
            'email' => 'new@example.com',
            'password' => 'password123',
            'password_confirm' => 'password123',
            'role' => 'admin',
            'email_verified_at' => '2020-01-01 00:00:00',
        ]);

        $user = $I->grabRecord(User::class, ['email' => 'new@example.com']);
        $I->assertSame(User::ROLE_USER, $user->role);
        $I->assertNull($user->email_verified_at);
    }

    public function registeringWithDeletedUsersEmailShowsValidationError(FunctionalTester $I)
    {
        UserFactory::create(['email' => 'gone@example.com'])->trash();

        $I->amUsingInertia();
        $I->sendAjaxPostRequest('/auth/register', [
            'name' => 'Someone',
            'email' => 'gone@example.com',
            'password' => 'password123',
            'password_confirm' => 'password123',
        ]);

        $I->seeResponseCodeIs(200);
        $page = $I->grabInertiaPage();
        $I->assertSame('Auth/Register', $page['component']);
        $I->assertSame('This email address has already been taken.', $page['props']['errors']['email']);
    }

    public function forgotPasswordDoesNotRevealAccounts(FunctionalTester $I)
    {
        $I->amUsingInertia();
        $I->sendAjaxPostRequest('/auth/forgot-password', ['email' => 'nobody@example.com']);
        $page = $I->grabInertiaPage();
        $I->assertSame('Auth/ForgotPassword', $page['component']);
        $I->assertStringContainsString('If an account exists', $page['props']['flash']['success']);
    }

    public function invalidResetLinkIsReported(FunctionalTester $I)
    {
        $I->amOnPage('/auth/reset-password?token=not-a-real-token');
        $page = $I->grabInertiaPage();
        $I->assertSame('Auth/ResetPassword', $page['component']);
        $I->assertFalse($page['props']['valid']);
    }
}
