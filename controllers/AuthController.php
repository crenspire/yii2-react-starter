<?php

namespace app\controllers;

use Yii;
use yii\filters\AccessControl;
use yii\filters\VerbFilter;
use Crenspire\Yii2Inertia\Inertia;
use app\models\LoginForm;
use app\models\PasswordResetRequestForm;
use app\models\PasswordResetToken;
use app\models\ResetPasswordForm;
use app\models\User;

class AuthController extends BaseController
{
    /**
     * {@inheritdoc}
     */
    public function behaviors()
    {
        return [
            'access' => [
                'class' => AccessControl::class,
                'only' => ['logout'],
                'rules' => [
                    [
                        'actions' => ['logout'],
                        'allow' => true,
                        'roles' => ['@'],
                    ],
                ],
                'denyCallback' => [$this, 'denyAccess'],
            ],
            'verbs' => [
                'class' => VerbFilter::class,
                'actions' => [
                    'logout' => ['post'],
                    'login' => ['get', 'post'],
                    'register' => ['get', 'post'],
                    'forgot-password' => ['get', 'post'],
                    'reset-password' => ['get', 'post'],
                ],
            ],
        ];
    }

    /**
     * Login action.
     */
    public function actionLogin()
    {
        if ($redirect = $this->redirectIfAuthenticated()) {
            return $redirect;
        }

        $model = new LoginForm();

        if ($model->load($this->request->post(), '') && $model->login()) {
            Yii::$app->session->setFlash('success', 'Welcome back!');
            // Full page load: the CSRF token and layout change after signing in
            return Inertia::location(Yii::$app->user->getReturnUrl(['/dashboard']));
        }

        return Inertia::render('Auth/Login', [
            'model' => [
                'email' => (string) $model->email,
                'rememberMe' => (bool) $model->rememberMe,
            ],
            'errors' => (object) $model->getFirstErrors(),
        ]);
    }

    /**
     * Register action.
     */
    public function actionRegister()
    {
        if ($redirect = $this->redirectIfAuthenticated()) {
            return $redirect;
        }

        $model = new User(['scenario' => User::SCENARIO_REGISTER]);

        if ($model->load($this->request->post(), '') && $model->save()) {
            Yii::$app->user->login($model);
            Yii::$app->session->setFlash('success', 'Your account has been created.');
            return Inertia::location(Yii::$app->user->getReturnUrl(['/dashboard']));
        }

        return Inertia::render('Auth/Register', [
            'model' => [
                'name' => (string) $model->name,
                'email' => (string) $model->email,
            ],
            'errors' => (object) $model->getFirstErrors(),
        ]);
    }

    /**
     * Logout action.
     */
    public function actionLogout()
    {
        // Also destroys the session and removes the remember-me cookie
        Yii::$app->user->logout();

        return Inertia::location(Yii::$app->homeUrl);
    }

    /**
     * Sends a password reset link.
     */
    public function actionForgotPassword()
    {
        if ($redirect = $this->redirectIfAuthenticated()) {
            return $redirect;
        }

        $model = new PasswordResetRequestForm();

        if ($model->load($this->request->post(), '') && $model->sendEmail()) {
            Yii::$app->session->setFlash(
                'success',
                'If an account exists for that email, we have sent a link to reset your password.'
            );
            return $this->inertiaRedirect(['/auth/forgot-password']);
        }

        return Inertia::render('Auth/ForgotPassword', [
            'errors' => (object) $model->getFirstErrors(),
        ]);
    }

    /**
     * Sets a new password using the token from the reset email.
     *
     * @param string|null $token
     */
    public function actionResetPassword($token = null)
    {
        if ($redirect = $this->redirectIfAuthenticated()) {
            return $redirect;
        }

        $model = new ResetPasswordForm(['token' => $token]);

        if ($model->load($this->request->post(), '') && $model->resetPassword()) {
            Yii::$app->session->setFlash('success', 'Your password has been reset. You can now sign in.');
            return $this->inertiaRedirect(['/auth/login']);
        }

        return Inertia::render('Auth/ResetPassword', [
            'token' => (string) $model->token,
            'valid' => PasswordResetToken::findValid($model->token) !== null,
            'errors' => (object) $model->getFirstErrors(),
        ]);
    }
}
