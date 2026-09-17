<?php

namespace app\commands;

use yii\console\Controller;
use yii\console\ExitCode;
use yii\helpers\Console;
use app\models\User;

/**
 * Seeds initial data
 */
class SeedController extends Controller
{
    /**
     * Creates an admin user, or grants the admin role if the account already exists.
     *
     * When no password is given a random one is generated and printed.
     *
     * @param string $email
     * @param string|null $password
     * @return int Exit code
     */
    public function actionAdmin($email = 'admin@example.com', $password = null)
    {
        $existing = User::findByEmail($email);
        if ($existing) {
            if (!$existing->isAdmin()) {
                $existing->role = User::ROLE_ADMIN;
                $existing->save(false, ['role']);
                $this->stdout("Existing user {$existing->email} is now an admin.\n", Console::FG_GREEN);
            } else {
                $this->stdout("Admin user {$existing->email} already exists.\n", Console::FG_YELLOW);
            }
            return ExitCode::OK;
        }

        $generated = $password === null;
        if ($generated) {
            $password = \Yii::$app->security->generateRandomString(16);
        }

        $user = new User(['scenario' => User::SCENARIO_ADMIN_CREATE]);
        $user->name = 'Admin User';
        $user->email = $email;
        $user->password = $password;
        $user->role = User::ROLE_ADMIN;

        if (!$user->save()) {
            $this->stderr("Failed to create admin user:\n", Console::FG_RED);
            foreach ($user->getFirstErrors() as $attribute => $error) {
                $this->stderr("  - {$attribute}: {$error}\n");
            }
            return ExitCode::DATAERR;
        }

        $this->stdout("Admin user created.\n", Console::FG_GREEN);
        $this->stdout("Email: {$user->email}\n");
        if ($generated) {
            $this->stdout("Password: {$password}\n");
        }
        return ExitCode::OK;
    }
}
