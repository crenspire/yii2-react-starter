<?php

namespace app\controllers;

use Crenspire\Yii2Inertia\Inertia;

class HomeController extends BaseController
{
    public function actionIndex()
    {
        return Inertia::render('Home');
    }
}
