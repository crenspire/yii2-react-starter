# Testing

Tests use [Codeception](https://codeception.com) with the Yii2 module.

```bash
vendor/bin/codecept run              # everything
vendor/bin/codecept run unit
vendor/bin/codecept run functional
vendor/bin/codecept run functional UsersCest:adminCanCreateUpdateAndDeleteUsers
```

## Test database

By default tests run against a SQLite database in `runtime/test.sqlite`, so no database server is needed. Before the
suite starts, `tests/_bootstrap.php` drops every table and applies all migrations, so the schema always matches your
migrations. Each test then runs in a transaction that is rolled back.

To run against MySQL, create a separate database and set:

```dotenv
TEST_DB_DSN="mysql:host=localhost;dbname=yii2basic_test"
TEST_DB_USERNAME=root
TEST_DB_PASSWORD=secret
```

> [!CAUTION]
> Never point the test connection at a development or production database. The bootstrap drops all tables.

The test configuration (`config/test.php`) is based on `config/web.php`, with CSRF validation turned off, an in-memory
cache and fast password hashing.

## Unit tests

`tests/unit` tests models and forms directly:

```php
public function testChangingPasswordRotatesAuthKey()
{
    $user = UserFactory::create();
    $oldKey = $user->getAuthKey();

    $user->setPassword('new-password-1');
    $user->save(false);

    verify($user->validateAuthKey($oldKey))->false();
}
```

Emails can be checked with `$this->tester->seeEmailIsSent()` and `grabLastSentEmail()`.

## Functional tests

`tests/functional` sends requests through the whole application: routing, access control, controllers and Inertia
responses.

```php
public function regularUserCannotManageUsers(FunctionalTester $I)
{
    $I->amLoggedInAs(UserFactory::create());
    $I->amOnPage('/users');
    $I->seeResponseCodeIs(403);
    $I->seeInertiaComponent('Error');
}
```

### Helpers

| Helper | Description |
| --- | --- |
| `UserFactory::create([...])` | Create a user; overrides for `name`, `email`, `password`, `role`, `email_verified_at` |
| `UserFactory::admin([...])` | Create an admin |
| `UserFactory::PASSWORD` | Default password of factory users |
| `$I->amUsingInertia()` | Send the headers of an Inertia visit, so responses are JSON page objects |
| `$I->grabInertiaPage()` | The page object (`component`, `props`, `url`, `version`) from a JSON or HTML response |
| `$I->seeInertiaComponent($name)` | Assert the rendered page component |
| `$I->seeResponseHeaderEndsWith($name, $value)` | Assert a response header, e.g. a redirect `Location` |

Inspect props to test what a page receives:

```php
$I->amLoggedInAs(UserFactory::admin());
$I->amOnPage('/users?sort_by=name&sort_order=asc');

$props = $I->grabInertiaPage()['props'];
$I->assertSame('asc', $props['sort']['sort_order']);
```

Test validation errors with an Inertia request, which renders the form again with `errors`:

```php
$I->amUsingInertia();
$I->sendAjaxPostRequest('/auth/register', ['name' => 'Someone', 'email' => 'taken@example.com', /* ... */]);
$I->assertSame('This email address has already been taken.', $I->grabInertiaPage()['props']['errors']['email']);
```

## Acceptance tests

Browser tests are disabled by default. To enable them:

1. Rename `tests/acceptance.suite.yml.example` to `tests/acceptance.suite.yml`.
2. Install the WebDriver module: `composer require --dev codeception/module-webdriver`.
3. Start Selenium or a browser driver such as ChromeDriver.
4. Build the frontend (`npm run build`) and start the test server: `tests/bin/yii serve`.
5. Run `vendor/bin/codecept run acceptance`.
