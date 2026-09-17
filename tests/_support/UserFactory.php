<?php

use app\models\User;

/**
 * Creates users for tests.
 */
class UserFactory
{
    const PASSWORD = 'password123';

    private static $sequence = 0;

    /**
     * @param array $attributes overrides for name, email, password, role and email_verified_at
     * @return User
     */
    public static function create(array $attributes = [])
    {
        self::$sequence++;
        $user = new User([
            'name' => $attributes['name'] ?? 'Test User ' . self::$sequence,
            'email' => $attributes['email'] ?? 'user' . self::$sequence . '@example.com',
            'password' => $attributes['password'] ?? self::PASSWORD,
            'role' => $attributes['role'] ?? User::ROLE_USER,
        ]);
        $user->email_verified_at = $attributes['email_verified_at'] ?? null;

        if (!$user->save(false)) {
            throw new RuntimeException('Could not create test user.');
        }

        return User::findOne($user->id);
    }

    /**
     * @param array $attributes
     * @return User
     */
    public static function admin(array $attributes = [])
    {
        return self::create(['role' => User::ROLE_ADMIN] + $attributes);
    }
}
