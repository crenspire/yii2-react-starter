<?php

namespace app\components;

use Yii;
use yii\base\BootstrapInterface;
use Crenspire\Yii2Inertia\Inertia;

/**
 * Configures the props shared with every page.
 *
 * Asset versioning, CSRF protection (XSRF-TOKEN cookie) and JSON request bodies are handled by the
 * `inertia` component of crenspire/yii2-inertia (see config/web.php).
 */
class InertiaBootstrap implements BootstrapInterface
{
    /**
     * {@inheritdoc}
     */
    public function bootstrap($app)
    {
        Inertia::share([
            // Namespaced under "auth" so page props named "user" (e.g. the user being edited) can't replace it
            'auth' => static function () {
                /** @var \app\models\User|null $user */
                $user = Yii::$app->user->identity;

                return [
                    'user' => $user === null
                        ? null
                        : $user->toArray(['id', 'name', 'email', 'role']) + ['isAdmin' => $user->isAdmin()],
                ];
            },
            // One-time messages set with Yii::$app->session->setFlash('success'|'error'|'info', ...)
            'flash' => static function () {
                return (object) Yii::$app->session->getAllFlashes(true);
            },
        ]);
    }
}
