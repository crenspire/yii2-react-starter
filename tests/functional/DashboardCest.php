<?php

use app\models\User;

class DashboardCest
{
    public function profileCanBeUpdatedWithPut(FunctionalTester $I)
    {
        $user = UserFactory::create(['email_verified_at' => '2024-01-01 00:00:00']);
        $I->amLoggedInAs($user);
        $I->amUsingInertia();
        $I->sendAjaxRequest('PUT', '/dashboard/profile', ['name' => 'Updated Name', 'email' => 'updated@example.com']);

        $I->seeRecord(User::class, ['id' => $user->id, 'name' => 'Updated Name', 'email' => 'updated@example.com', 'email_verified_at' => null]);
    }

    public function statsAreOnlyShownToAdmins(FunctionalTester $I)
    {
        $I->amLoggedInAs(UserFactory::create());
        $I->amOnPage('/dashboard');
        $I->assertNull($I->grabInertiaPage()['props']['stats']);

        $I->amLoggedInAs(UserFactory::admin());
        $I->amOnPage('/dashboard');
        $stats = $I->grabInertiaPage()['props']['stats'];
        $I->assertCount(6, $stats['signups']);
        $I->assertGreaterThanOrEqual(2, $stats['totalUsers']);
    }

    public function sharedUserPropsDoNotLeakSecrets(FunctionalTester $I)
    {
        $I->amLoggedInAs(UserFactory::admin(['name' => 'Ada']));
        $I->amOnPage('/dashboard');
        $props = $I->grabInertiaPage()['props'];

        $I->assertSame(['id', 'name', 'email', 'role', 'isAdmin'], array_keys($props['auth']['user']));
        $I->assertTrue($props['auth']['user']['isAdmin']);
        // The CSRF token is sent in the XSRF-TOKEN cookie, not as a prop
        $I->assertArrayNotHasKey('csrfToken', $props);
    }
}
