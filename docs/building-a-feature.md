# Building a feature

This walkthrough adds a small **Projects** section: a list page and a form to create projects. It touches every layer
of the application.

## 1. Create a migration

```bash
php yii migrate/create create_projects_table
```

```php
// migrations/m260101_000000_create_projects_table.php
public function safeUp()
{
    $this->createTable('{{%projects}}', [
        'id' => $this->primaryKey(),
        'user_id' => $this->integer()->notNull(),
        'name' => $this->string(255)->notNull(),
        'created_at' => $this->timestamp()->notNull()->defaultExpression('CURRENT_TIMESTAMP'),
        'updated_at' => $this->timestamp()->notNull()->defaultExpression('CURRENT_TIMESTAMP'),
    ]);
    $this->createIndex('idx-projects-user_id', '{{%projects}}', 'user_id');
}

public function safeDown()
{
    $this->dropTable('{{%projects}}');
}
```

```bash
php yii migrate
```

## 2. Create the model

```php
// models/Project.php
namespace app\models;

use yii\behaviors\TimestampBehavior;
use yii\db\ActiveRecord;
use yii\db\Expression;

class Project extends ActiveRecord
{
    public static function tableName()
    {
        return '{{%projects}}';
    }

    public function behaviors()
    {
        return [['class' => TimestampBehavior::class, 'value' => new Expression('CURRENT_TIMESTAMP')]];
    }

    public function rules()
    {
        return [
            ['name', 'trim'],
            ['name', 'required'],
            ['name', 'string', 'max' => 255],
        ];
    }

    public function fields()
    {
        return ['id', 'name', 'created_at'];
    }
}
```

Only attributes with rules can be set by `load()`, so `user_id` is safe from user input. `fields()` controls what is
sent to the browser.

## 3. Create the controller

```php
// controllers/ProjectController.php
namespace app\controllers;

use Yii;
use yii\filters\AccessControl;
use yii\filters\VerbFilter;
use Crenspire\Yii2Inertia\Inertia;
use app\models\Project;

class ProjectController extends BaseController
{
    public function behaviors()
    {
        return [
            'access' => [
                'class' => AccessControl::class,
                'rules' => [['allow' => true, 'roles' => ['@']]],
                'denyCallback' => [$this, 'denyAccess'],
            ],
            'verbs' => [
                'class' => VerbFilter::class,
                'actions' => ['index' => ['get'], 'create' => ['get', 'post']],
            ],
        ];
    }

    public function actionIndex()
    {
        $projects = Project::find()
            ->where(['user_id' => Yii::$app->user->id])
            ->orderBy(['created_at' => SORT_DESC])
            ->all();

        return Inertia::render('Projects/Index', [
            'projects' => array_map(fn (Project $project) => $project->toArray(), $projects),
        ]);
    }

    public function actionCreate()
    {
        $model = new Project(['user_id' => Yii::$app->user->id]);

        if ($model->load($this->request->post(), '') && $model->save()) {
            Yii::$app->session->setFlash('success', 'Project created.');
            return $this->inertiaRedirect(['/project/index']);
        }

        return Inertia::render('Projects/Create', [
            'errors' => (object) $model->getFirstErrors(),
        ]);
    }
}
```

## 4. Add URL rules

```php
// config/web.php, urlManager rules
'projects' => 'project/index',
'projects/create' => 'project/create',
```

## 5. Create the pages

```jsx
// resources/js/pages/Projects/Index.jsx
import { Head, Link } from '@inertiajs/react'
import { FolderKanban, Plus } from 'lucide-react'
import AppLayout from '@/components/layouts/AppLayout'
import { PageHeader } from '@/components/page-header'
import { Button } from '@/components/ui/button'
import { Card, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { formatRelative } from '@/lib/format'

export default function ProjectsIndex({ projects }) {
  return (
    <>
      <Head title="Projects" />
      <PageHeader title="Projects" description="Everything you're working on.">
        <Button asChild>
          <Link href="/projects/create">
            <Plus />
            New project
          </Link>
        </Button>
      </PageHeader>

      {projects.length === 0
        ? (
            <div className="flex flex-col items-center gap-2 rounded-lg border border-dashed py-16 text-center">
              <FolderKanban className="text-muted-foreground size-8" />
              <p className="font-medium">No projects yet</p>
            </div>
          )
        : (
            <div className="grid gap-4 @xl/main:grid-cols-2 @5xl/main:grid-cols-3">
              {projects.map(project => (
                <Card key={project.id}>
                  <CardHeader>
                    <CardTitle>{project.name}</CardTitle>
                    <CardDescription>
                      Created
                      {' '}
                      {formatRelative(project.created_at)}
                    </CardDescription>
                  </CardHeader>
                </Card>
              ))}
            </div>
          )}
    </>
  )
}

ProjectsIndex.layout = page => (
  <AppLayout breadcrumbs={[{ title: 'Dashboard', href: '/dashboard' }, { title: 'Projects' }]}>{page}</AppLayout>
)
```

```jsx
// resources/js/pages/Projects/Create.jsx
import { Head, Link, useForm } from '@inertiajs/react'
import { FormField } from '@/components/FormField'
import AppLayout from '@/components/layouts/AppLayout'
import { PageHeader } from '@/components/page-header'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardFooter } from '@/components/ui/card'
import { Input } from '@/components/ui/input'

export default function ProjectsCreate() {
  const { data, setData, post, processing, errors } = useForm({ name: '' })

  const submit = (e) => {
    e.preventDefault()
    post('/projects/create')
  }

  return (
    <>
      <Head title="New project" />
      <PageHeader title="New project" />
      <form onSubmit={submit} className="max-w-xl">
        <Card>
          <CardContent>
            <FormField id="name" label="Name" error={errors.name}>
              <Input id="name" value={data.name} onChange={e => setData('name', e.target.value)} aria-invalid={!!errors.name} />
            </FormField>
          </CardContent>
          <CardFooter className="justify-end gap-2 border-t">
            <Button variant="outline" asChild><Link href="/projects">Cancel</Link></Button>
            <Button type="submit" disabled={processing}>Create project</Button>
          </CardFooter>
        </Card>
      </form>
    </>
  )
}

ProjectsCreate.layout = page => (
  <AppLayout breadcrumbs={[{ title: 'Projects', href: '/projects' }, { title: 'New project' }]}>{page}</AppLayout>
)
```

## 6. Add a sidebar link

In `resources/js/components/app/app-sidebar.jsx`, add `FolderKanban` to the `lucide-react` import and a
navigation item:

```jsx
const platform = [
  { title: 'Dashboard', href: '/dashboard', icon: LayoutDashboard, isActive: path === '/dashboard' },
  { title: 'Projects', href: '/projects', icon: FolderKanban, isActive: path.startsWith('/projects') },
  // ...
]
```

## 7. Write a functional test

```php
// tests/functional/ProjectsCest.php
use app\models\Project;

class ProjectsCest
{
    public function guestsAreSentToSignIn(FunctionalTester $I)
    {
        $I->amOnPage('/projects');
        $I->seeInertiaComponent('Auth/Login');
    }

    public function userCanCreateAProject(FunctionalTester $I)
    {
        $user = UserFactory::create();
        $I->amLoggedInAs($user);

        $I->sendAjaxPostRequest('/projects/create', ['name' => 'Website redesign']);

        $I->seeRecord(Project::class, ['user_id' => $user->id, 'name' => 'Website redesign']);
    }

    public function nameIsRequired(FunctionalTester $I)
    {
        $I->amLoggedInAs(UserFactory::create());
        $I->amUsingInertia();
        $I->sendAjaxPostRequest('/projects/create', ['name' => '']);

        $I->assertArrayHasKey('name', $I->grabInertiaPage()['props']['errors']);
    }
}
```

```bash
vendor/bin/codecept run functional ProjectsCest
```

The test database is rebuilt from your migrations on every run, so the new table is there automatically.
