<?php

namespace tests\unit\models;

use app\models\User;
use UserFactory;

class UserTest extends \Codeception\Test\Unit
{
    public function testPasswordIsHashedOnSave()
    {
        $user = UserFactory::create(['password' => 'secret-password']);

        verify($user->getAttribute('password'))->notEquals('secret-password');
        verify($user->password)->null();
        verify($user->validatePassword('secret-password'))->true();
        verify($user->validatePassword('wrong-password'))->false();
    }

    public function testRegistrationCannotAssignProtectedAttributes()
    {
        $user = new User(['scenario' => User::SCENARIO_REGISTER]);
        $user->load([
            'name' => 'Mallory',
            'email' => 'mallory@example.com',
            'password' => 'password123',
            'password_confirm' => 'password123',
            'role' => User::ROLE_ADMIN,
            'email_verified_at' => '2020-01-01 00:00:00',
            'deleted_at' => '2020-01-01 00:00:00',
            'remember_token' => 'chosen-token',
        ], '');

        verify($user->save())->true();
        $user->refresh();
        verify($user->role)->equals(User::ROLE_USER);
        verify($user->email_verified_at)->null();
        verify($user->deleted_at)->null();
        verify($user->remember_token)->notEquals('chosen-token');
    }

    public function testRegistrationRequiresMatchingPasswords()
    {
        $user = new User(['scenario' => User::SCENARIO_REGISTER]);
        $user->load(['name' => 'A', 'email' => 'a@example.com', 'password' => 'password123', 'password_confirm' => 'other'], '');

        verify($user->validate())->false();
        verify($user->errors)->arrayHasKey('password_confirm');
    }

    public function testEmailMustBeUniqueIncludingSoftDeletedUsers()
    {
        $deleted = UserFactory::create(['email' => 'taken@example.com']);
        $deleted->trash();

        $user = new User(['scenario' => User::SCENARIO_REGISTER]);
        $user->load(['name' => 'B', 'email' => 'TAKEN@example.com', 'password' => 'password123', 'password_confirm' => 'password123'], '');

        verify($user->validate())->false();
        verify($user->getFirstError('email'))->equals('This email address has already been taken.');
    }

    public function testChangingPasswordRotatesAuthKey()
    {
        $user = UserFactory::create();
        $oldKey = $user->getAuthKey();

        $user->setPassword('new-password-1');
        verify($user->save(false))->true();

        verify($user->getAuthKey())->notEquals($oldKey);
        verify($user->validateAuthKey($oldKey))->false();
        verify($user->validateAuthKey($user->getAuthKey()))->true();
    }

    public function testSavingAgainDoesNotRehashPassword()
    {
        $user = UserFactory::create(['password' => 'secret-password']);
        $user->name = 'Renamed';
        verify($user->save())->true();

        verify($user->validatePassword('secret-password'))->true();
    }

    public function testChangingEmailClearsVerification()
    {
        $user = UserFactory::create(['email_verified_at' => '2024-01-01 00:00:00']);
        $user->email = 'changed@example.com';
        verify($user->save())->true();

        verify($user->email_verified_at)->null();
    }

    public function testSerializationHidesSecrets()
    {
        $data = UserFactory::create()->toArray();

        verify($data)->arrayHasNotKey('password');
        verify($data)->arrayHasNotKey('remember_token');
        verify($data)->arrayHasKey('role');
    }

    public function testSoftDeletedUsersCannotBeFound()
    {
        $user = UserFactory::create();
        $user->trash();

        verify(User::findIdentity($user->id))->null();
        verify(User::findByEmail($user->email))->null();
        verify(User::findWithTrashed()->where(['id' => $user->id])->exists())->true();
    }
}
