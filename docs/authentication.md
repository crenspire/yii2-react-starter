# Authentication and roles

## Included flows

| Flow | URL | Controller action |
| --- | --- | --- |
| Sign in | `/auth/login` | `AuthController::actionLogin` |
| Create an account | `/auth/register` | `AuthController::actionRegister` |
| Sign out | `POST /auth/logout` | `AuthController::actionLogout` |
| Forgot password | `/auth/forgot-password` | `AuthController::actionForgotPassword` |
| Reset password | `/auth/reset-password?token=…` | `AuthController::actionResetPassword` |
| Change password | `/dashboard/settings` | `DashboardController::actionPassword` |
| Edit profile | `/dashboard/profile` | `DashboardController::actionProfile` |

### Signing in

`models/LoginForm.php` validates the credentials.

- The error message is the same for an unknown email and a wrong password, and both take the same time, so the form
  can't be used to find out which emails are registered.
- After `loginMaxAttempts` failures for the same email and IP address, sign-in is blocked for `loginLockoutDuration`
  seconds (see [Configuration](configuration.md#application-parameters)).
- "Keep me signed in" sets a remember-me cookie for `rememberMeDuration`.
- After signing in, users return to the page they originally requested.

### Password resets

1. `PasswordResetRequestForm` sends a link if an account exists. The response is the same either way, and repeated
   requests for one address are throttled.
2. The link contains a random token. Only its SHA-256 hash is stored in `password_reset_tokens`, and it expires after
   `passwordResetTokenExpire` seconds.
3. `ResetPasswordForm` sets the new password and deletes the token, so each link works once.

In development, open the email from `runtime/mail` to follow the link.

### Password changes

Changing a password, whether from Settings, a reset link or an admin edit, generates a new auth key. This signs the
user out of every other session and invalidates remember-me cookies. The current session is renewed so the user stays
signed in.

Passwords must be 8 to 72 characters (72 bytes is the bcrypt limit).

## Roles

Every user has a `role` column: `user` (the default) or `admin`.

| | `user` | `admin` |
| --- | --- | --- |
| Dashboard, profile, settings, billing | ✓ | ✓ |
| Site statistics on the dashboard | | ✓ |
| Users section: list, create, edit, delete, change roles | | ✓ |

Manage roles from the command line:

```bash
php yii seed/admin admin@example.com          # create an admin, or promote an existing user
php yii user/set-role jane@example.com admin
php yii user/set-role jane@example.com user
```

Admins can also change roles in the user form. They can't change their own role or delete their own account, so
there is always a way back in.

## Protecting controllers

Use Yii's `AccessControl` filter with `BaseController::denyAccess` as the deny callback:

```php
public function behaviors()
{
    return [
        'access' => [
            'class' => AccessControl::class,
            'rules' => [
                [
                    'allow' => true,
                    'roles' => ['@'],
                    // Remove this to allow every signed-in user
                    'matchCallback' => fn () => Yii::$app->user->identity->isAdmin(),
                ],
            ],
            'denyCallback' => [$this, 'denyAccess'],
        ],
    ];
}
```

Guests are sent to the sign-in page and brought back afterwards; signed-in users without access see a 403 page.

Always enforce access on the server. Hiding a link in the UI is not enough.

### Checking the role in React

The shared `auth.user` prop includes `isAdmin`:

```jsx
function AdminLink() {
  const { user } = usePage().props.auth

  return user?.isAdmin ? <Link href="/users">Users</Link> : null
}
```

### Adding more roles

For a few fixed roles, add constants to `User`, include them in `User::roles()`, and check them in `matchCallback`. For
fine-grained permissions, switch to [Yii's RBAC](https://www.yiiframework.com/doc/guide/2.0/en/security-authorization#rbac)
and use `'roles' => ['managePosts']` in your access rules.

## Soft deletes

Deleting a user sets `deleted_at` instead of removing the row. `User::find()` excludes deleted users, so they can't
sign in, and existing sessions end. Use `User::findWithTrashed()` to include them.

A deleted user's email address stays reserved, because the database enforces a unique index on it.
