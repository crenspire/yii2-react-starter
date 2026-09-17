<?php

namespace app\commands;

use yii\console\Controller;
use yii\console\ExitCode;
use yii\helpers\Console;
use app\models\User;

/**
 * Manages user accounts from the command line
 */
class UserController extends Controller
{
    /**
     * Sets a user's role.
     *
     * @param string $email
     * @param string $role "admin" or "user"
     * @return int Exit code
     */
    public function actionSetRole($email, $role)
    {
        if (!array_key_exists($role, User::roles())) {
            $this->stderr('Role must be one of: ' . implode(', ', array_keys(User::roles())) . "\n", Console::FG_RED);
            return ExitCode::USAGE;
        }

        $user = User::findByEmail($email);
        if ($user === null) {
            $this->stderr("No active user found with email {$email}.\n", Console::FG_RED);
            return ExitCode::DATAERR;
        }

        $user->role = $role;
        $user->save(false, ['role']);
        $this->stdout("{$user->email} now has the role \"{$role}\".\n", Console::FG_GREEN);

        return ExitCode::OK;
    }
}
