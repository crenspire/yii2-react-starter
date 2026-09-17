<?php

namespace app\controllers;

use Yii;
use yii\filters\AccessControl;
use yii\filters\VerbFilter;
use Crenspire\Yii2Inertia\Inertia;
use app\models\ChangePasswordForm;
use app\models\User;

class DashboardController extends BaseController
{
    /**
     * {@inheritdoc}
     */
    public function behaviors()
    {
        return [
            'access' => [
                'class' => AccessControl::class,
                'rules' => [
                    [
                        'allow' => true,
                        'roles' => ['@'],
                    ],
                ],
                'denyCallback' => [$this, 'denyAccess'],
            ],
            'verbs' => [
                'class' => VerbFilter::class,
                'actions' => [
                    'index' => ['get'],
                    'profile' => ['get', 'post', 'put'],
                    'settings' => ['get'],
                    'password' => ['post', 'put'],
                    'billing' => ['get'],
                ],
            ],
        ];
    }

    /**
     * Dashboard index action. Site-wide statistics are only shown to admins.
     */
    public function actionIndex()
    {
        /** @var User $identity */
        $identity = Yii::$app->user->identity;

        return Inertia::render('Dashboard/Index', [
            'account' => [
                'emailVerified' => $identity->hasVerifiedEmail(),
                'memberSince' => $identity->created_at,
            ],
            'stats' => $identity->isAdmin() ? $this->userStats() : null,
            'recentUsers' => $identity->isAdmin()
                ? array_map(static fn (User $user) => $user->toArray(), User::find()->orderBy(['created_at' => SORT_DESC, 'id' => SORT_DESC])->limit(5)->all())
                : [],
        ]);
    }

    /**
     * Shows and updates the signed-in user's profile.
     */
    public function actionProfile()
    {
        // Work on a fresh copy so failed validation doesn't alter the identity shared with the page
        $user = User::findOne(Yii::$app->user->id);

        if (!$this->request->getIsGet()) {
            $user->load($this->request->getBodyParams(), '');
            if ($user->save()) {
                Yii::$app->session->setFlash('success', 'Profile updated successfully.');
                return $this->inertiaRedirect(['/dashboard/profile']);
            }
        }

        return Inertia::render('Dashboard/Profile', [
            'profile' => [
                'name' => $user->name,
                'email' => $user->email,
                'emailVerified' => $user->hasVerifiedEmail(),
            ],
            'errors' => (object) $user->getFirstErrors(),
        ]);
    }

    /**
     * Settings page.
     */
    public function actionSettings()
    {
        return Inertia::render('Dashboard/Settings', [
            'errors' => new \stdClass(),
        ]);
    }

    /**
     * Changes the signed-in user's password.
     */
    public function actionPassword()
    {
        $model = new ChangePasswordForm(User::findOne(Yii::$app->user->id));
        $model->load($this->request->getBodyParams(), '');

        if ($model->changePassword()) {
            // The password change rotated the auth key; renew this session so the user stays signed in
            $userComponent = Yii::$app->user;
            $hadRememberCookie = $this->request->cookies->has($userComponent->identityCookie['name']);
            $userComponent->login($model->getUser(), $hadRememberCookie ? Yii::$app->params['rememberMeDuration'] : 0);

            Yii::$app->session->setFlash('success', 'Your password has been changed.');
            return $this->inertiaRedirect(['/dashboard/settings']);
        }

        return Inertia::render('Dashboard/Settings', [
            'errors' => (object) $model->getFirstErrors(),
        ]);
    }

    /**
     * Billing action.
     */
    public function actionBilling()
    {
        return Inertia::render('Dashboard/Billing');
    }

    /**
     * @return array user counts and sign-ups for the last six months
     */
    private function userStats()
    {
        $monthStart = date('Y-m-01 00:00:00');
        $chartStart = date('Y-m-01 00:00:00', strtotime('first day of -5 months'));

        $signups = [];
        for ($i = 5; $i >= 0; $i--) {
            $time = strtotime("first day of -{$i} months");
            $signups[date('Y-m', $time)] = ['month' => date('M', $time), 'users' => 0];
        }
        $createdDates = User::find()->select('created_at')->where(['>=', 'created_at', $chartStart])->column();
        foreach ($createdDates as $createdAt) {
            $key = substr((string) $createdAt, 0, 7);
            if (isset($signups[$key])) {
                $signups[$key]['users']++;
            }
        }

        $previousMonthStart = date('Y-m-01 00:00:00', strtotime('first day of last month'));

        return [
            'totalUsers' => (int) User::find()->count(),
            'verifiedUsers' => (int) User::find()->andWhere(['not', ['email_verified_at' => null]])->count(),
            'newThisMonth' => (int) User::find()->andWhere(['>=', 'created_at', $monthStart])->count(),
            'newLastMonth' => (int) User::find()
                ->andWhere(['>=', 'created_at', $previousMonthStart])
                ->andWhere(['<', 'created_at', $monthStart])
                ->count(),
            'admins' => (int) User::find()->andWhere(['role' => User::ROLE_ADMIN])->count(),
            'signups' => array_values($signups),
        ];
    }
}
