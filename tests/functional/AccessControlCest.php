<?php

use app\models\User;

class AccessControlCest
{
    public function guestIsRedirectedToLogin(FunctionalTester $I)
    {
        $I->amOnPage('/dashboard');
        $I->seeInCurrentUrl('/auth/login');
        $I->seeInertiaComponent('Auth/Login');
    }

    public function inertiaRedirectsIncludeLocationHeader(FunctionalTester $I)
    {
        $I->amUsingInertia();
        $I->stopFollowingRedirects();
        $I->amOnPage('/dashboard');
        $I->seeResponseCodeIs(303);
        $I->seeResponseHeaderEndsWith('Location', '/auth/login');
    }

    public function userReturnsToRequestedPageAfterLogin(FunctionalTester $I)
    {
        UserFactory::create(['email' => 'demo@example.com']);
        $I->amOnPage('/dashboard/settings');
        $I->stopFollowingRedirects();
        $I->sendAjaxPostRequest('/auth/login', ['email' => 'demo@example.com', 'password' => UserFactory::PASSWORD]);
        $I->seeResponseCodeIs(302);
        $I->seeResponseHeaderEndsWith('Location', '/dashboard/settings');
    }

    public function regularUserCannotManageUsers(FunctionalTester $I)
    {
        $admin = UserFactory::admin(['email' => 'admin@example.com']);
        $I->amLoggedInAs(UserFactory::create());

        $I->amOnPage('/users');
        $I->seeResponseCodeIs(403);
        $I->seeInertiaComponent('Error');

        $I->sendAjaxPostRequest("/users/{$admin->id}/edit", [
            'name' => 'Hacked',
            'email' => 'admin@example.com',
            'password' => 'attacker-password',
            'role' => 'admin',
        ]);
        $I->seeResponseCodeIs(403);
        verify(User::findOne($admin->id)->validatePassword(UserFactory::PASSWORD))->true();
    }

    public function adminCanManageUsers(FunctionalTester $I)
    {
        $I->amLoggedInAs(UserFactory::admin());
        $I->amOnPage('/users');
        $I->seeResponseCodeIs(200);
        $I->seeInertiaComponent('Users/Index');
    }

    public function missingUserShowsErrorPage(FunctionalTester $I)
    {
        $I->amLoggedInAs(UserFactory::admin());
        $I->amUsingInertia();
        $I->amOnPage('/users/999999');
        $I->seeResponseCodeIs(404);
        $page = $I->grabInertiaPage();
        $I->assertSame('Error', $page['component']);
        $I->assertSame('The requested user does not exist.', $page['props']['message']);
    }

    public function deleteRequiresPost(FunctionalTester $I)
    {
        $I->amLoggedInAs(UserFactory::admin());
        $user = UserFactory::create();
        $I->amOnPage("/users/{$user->id}/delete");
        $I->seeResponseCodeIs(405);
        $I->seeRecord(User::class, ['id' => $user->id, 'deleted_at' => null]);
    }
}
