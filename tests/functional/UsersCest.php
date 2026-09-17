<?php

use app\models\User;

class UsersCest
{
    public function _before(FunctionalTester $I)
    {
        $I->amLoggedInAs(UserFactory::admin(['name' => 'Admin']));
    }

    public function invalidPaginationValuesAreClamped(FunctionalTester $I)
    {
        $I->amOnPage('/users?per_page=0&page=-5');
        $I->seeResponseCodeIs(200);
        $pagination = $I->grabInertiaPage()['props']['pagination'];
        $I->assertSame(1, $pagination['per_page']);
        $I->assertSame(1, $pagination['current_page']);

        $I->amOnPage('/users?per_page=100000');
        $I->assertSame(100, $I->grabInertiaPage()['props']['pagination']['per_page']);
    }

    public function pageUrlKeepsQueryStringOnce(FunctionalTester $I)
    {
        $I->amOnPage('/users?search=Admin&page=1');
        $I->assertSame('/users?search=Admin&page=1', $I->grabInertiaPage()['url']);

        $I->amUsingInertia();
        $I->amOnPage('/users?search=Admin&page=1');
        $I->assertSame('/users?search=Admin&page=1', $I->grabInertiaPage()['url']);
    }

    public function sortOrderIsReturnedAsString(FunctionalTester $I)
    {
        UserFactory::create(['name' => 'Zed']);
        $I->amOnPage('/users?sort_by=name&sort_order=asc');
        $props = $I->grabInertiaPage()['props'];

        $I->assertSame(['sort_by' => 'name', 'sort_order' => 'asc'], $props['sort']);
        $I->assertSame('Admin', $props['users'][0]['name']);
        $I->assertArrayNotHasKey('password', $props['users'][0]);
    }

    public function adminCanCreateUpdateAndDeleteUsers(FunctionalTester $I)
    {
        $I->amUsingInertia();
        $I->sendAjaxPostRequest('/users/create', [
            'name' => 'Created',
            'email' => 'created@example.com',
            'password' => 'password123',
            'role' => 'user',
        ]);
        $user = $I->grabRecord(User::class, ['email' => 'created@example.com']);

        $I->sendAjaxPostRequest("/users/{$user->id}/edit", [
            'name' => 'Renamed',
            'email' => 'created@example.com',
            'password' => '',
            'role' => 'admin',
        ]);
        $user = User::findOne($user->id);
        $I->assertSame('Renamed', $user->name);
        $I->assertTrue($user->isAdmin());
        $I->assertTrue($user->validatePassword('password123'));

        $I->sendAjaxPostRequest("/users/{$user->id}/delete");
        $I->assertNull(User::findOne($user->id));
    }

    public function editedUserDoesNotReplaceSignedInUser(FunctionalTester $I)
    {
        $admin = Yii::$app->user->identity;
        $other = UserFactory::create(['name' => 'Someone Else']);

        $I->amOnPage("/users/{$other->id}/edit");
        $props = $I->grabInertiaPage()['props'];

        $I->assertSame($other->id, $props['user']['id']);
        $I->assertSame($admin->id, $props['auth']['user']['id']);
        $I->assertTrue($props['auth']['user']['isAdmin']);
    }

    public function adminCannotDemoteOrDeleteThemselves(FunctionalTester $I)
    {
        $self = Yii::$app->user->identity;
        $I->amUsingInertia();

        $I->sendAjaxPostRequest("/users/{$self->id}/edit", [
            'name' => 'Admin',
            'email' => $self->email,
            'role' => 'user',
        ]);
        $I->assertSame('You cannot remove your own admin role.', $I->grabInertiaPage()['props']['errors']['role']);

        $I->sendAjaxPostRequest("/users/{$self->id}/delete");
        $I->seeRecord(User::class, ['id' => $self->id, 'deleted_at' => null, 'role' => 'admin']);
    }
}
