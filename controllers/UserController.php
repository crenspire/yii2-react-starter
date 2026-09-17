<?php

namespace app\controllers;

use Yii;
use yii\filters\AccessControl;
use yii\filters\VerbFilter;
use yii\web\NotFoundHttpException;
use Crenspire\Yii2Inertia\Inertia;
use app\models\User;

/**
 * User management. Restricted to admins.
 */
class UserController extends BaseController
{
    const MAX_PER_PAGE = 100;
    const SORTABLE_COLUMNS = ['id', 'name', 'email', 'role', 'email_verified_at', 'created_at', 'updated_at'];

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
                        'matchCallback' => function () {
                            return Yii::$app->user->identity->isAdmin();
                        },
                    ],
                ],
                'denyCallback' => [$this, 'denyAccess'],
            ],
            'verbs' => [
                'class' => VerbFilter::class,
                'actions' => [
                    'index' => ['get'],
                    'view' => ['get'],
                    'create' => ['get', 'post'],
                    'update' => ['get', 'post', 'put'],
                    'delete' => ['post'],
                ],
            ],
        ];
    }

    /**
     * Lists users with search, filters, sorting and pagination.
     */
    public function actionIndex()
    {
        $request = $this->request;
        $search = trim((string) $request->get('search', ''));
        $emailVerified = (string) $request->get('email_verified', '');
        $dateFrom = $this->parseDate($request->get('date_from'));
        $dateTo = $this->parseDate($request->get('date_to'));
        $perPage = min(max((int) $request->get('per_page', 20), 1), self::MAX_PER_PAGE);
        $sortBy = in_array($request->get('sort_by'), self::SORTABLE_COLUMNS, true) ? $request->get('sort_by') : 'created_at';
        $sortOrder = strtolower((string) $request->get('sort_order')) === 'asc' ? 'asc' : 'desc';

        $query = User::find();

        if ($search !== '') {
            $query->andWhere(['or', ['like', 'name', $search], ['like', 'email', $search]]);
        }
        if ($emailVerified === 'verified') {
            $query->andWhere(['not', ['email_verified_at' => null]]);
        } elseif ($emailVerified === 'unverified') {
            $query->andWhere(['email_verified_at' => null]);
        } else {
            $emailVerified = '';
        }
        if ($dateFrom !== '') {
            $query->andWhere(['>=', 'created_at', $dateFrom . ' 00:00:00']);
        }
        if ($dateTo !== '') {
            $query->andWhere(['<=', 'created_at', $dateTo . ' 23:59:59']);
        }

        $total = (int) $query->count();
        $lastPage = max((int) ceil($total / $perPage), 1);
        $page = min(max((int) $request->get('page', 1), 1), $lastPage);

        $users = $query
            ->orderBy([$sortBy => $sortOrder === 'asc' ? SORT_ASC : SORT_DESC, 'id' => SORT_DESC])
            ->offset(($page - 1) * $perPage)
            ->limit($perPage)
            ->all();

        return Inertia::render('Users/Index', [
            'users' => array_map(static fn (User $user) => $user->toArray(), $users),
            'pagination' => [
                'current_page' => $page,
                'per_page' => $perPage,
                'total' => $total,
                'last_page' => $lastPage,
            ],
            'filters' => [
                'search' => $search,
                'email_verified' => $emailVerified,
                'date_from' => $dateFrom,
                'date_to' => $dateTo,
            ],
            'sort' => [
                'sort_by' => $sortBy,
                'sort_order' => $sortOrder,
            ],
        ]);
    }

    /**
     * Displays a single user.
     *
     * @param int $id
     * @throws NotFoundHttpException if the user cannot be found
     */
    public function actionView($id)
    {
        return Inertia::render('Users/View', [
            'user' => $this->findModel($id)->toArray(),
        ]);
    }

    /**
     * Creates a new user.
     */
    public function actionCreate()
    {
        $model = new User(['scenario' => User::SCENARIO_ADMIN_CREATE, 'role' => User::ROLE_USER]);

        if ($model->load($this->request->post(), '') && $model->save()) {
            Yii::$app->session->setFlash('success', 'User created successfully.');
            return $this->inertiaRedirect(['/user/index']);
        }

        return $this->renderForm($model);
    }

    /**
     * Updates an existing user. Leaving the password blank keeps the current one.
     *
     * @param int $id
     * @throws NotFoundHttpException if the user cannot be found
     */
    public function actionUpdate($id)
    {
        $model = $this->findModel($id);
        $model->scenario = User::SCENARIO_ADMIN_UPDATE;

        if (!$this->request->getIsGet() && $model->load($this->request->getBodyParams(), '')) {
            if ((int) $model->id === (int) Yii::$app->user->id && $model->role !== User::ROLE_ADMIN) {
                $model->addError('role', 'You cannot remove your own admin role.');
            } elseif ($model->save()) {
                Yii::$app->session->setFlash('success', 'User updated successfully.');
                return $this->inertiaRedirect(['/user/index']);
            }
        }

        return $this->renderForm($model);
    }

    /**
     * Soft-deletes a user.
     *
     * @param int $id
     * @throws NotFoundHttpException if the user cannot be found
     */
    public function actionDelete($id)
    {
        $model = $this->findModel($id);

        if ((int) $model->id === (int) Yii::$app->user->id) {
            Yii::$app->session->setFlash('error', 'You cannot delete your own account.');
        } else {
            $model->trash();
            Yii::$app->session->setFlash('success', 'User deleted successfully.');
        }

        // Back to the list with its current filters and page
        return $this->redirectBack();
    }

    /**
     * @param User $model
     */
    private function renderForm(User $model)
    {
        return Inertia::render('Users/Form', [
            'user' => [
                'id' => $model->id,
                'name' => (string) $model->name,
                'email' => (string) $model->email,
                'role' => (string) $model->role,
            ],
            'roles' => User::roles(),
            'isSelf' => $model->id !== null && (int) $model->id === (int) Yii::$app->user->id,
            'errors' => (object) $model->getFirstErrors(),
        ]);
    }

    /**
     * @param mixed $value
     * @return string the date as Y-m-d, or '' when not a valid date
     */
    private function parseDate($value)
    {
        $date = is_string($value) ? \DateTime::createFromFormat('!Y-m-d', $value) : false;

        return $date && $date->format('Y-m-d') === $value ? $value : '';
    }

    /**
     * Finds the User model based on its primary key value.
     *
     * @param int $id
     * @return User the loaded model
     * @throws NotFoundHttpException if the model cannot be found
     */
    protected function findModel($id)
    {
        if (($model = User::findOne((int) $id)) !== null) {
            return $model;
        }

        throw new NotFoundHttpException('The requested user does not exist.');
    }
}
