<?php

namespace app\controllers;

use Yii;
use yii\helpers\Url;
use yii\web\Controller;
use yii\web\ForbiddenHttpException;
use yii\web\Response;
use Crenspire\Yii2Inertia\Inertia;

/**
 * Base controller with Inertia-aware redirects, access handling and CSRF failure handling.
 */
class BaseController extends Controller
{
    /**
     * {@inheritdoc}
     */
    public function beforeAction($action)
    {
        // An expired or missing CSRF token on an Inertia request sends the user back with a message
        // instead of showing an error page.
        if ($this->enableCsrfValidation
            && Yii::$app->getErrorHandler()->exception === null
            && Inertia::isInertiaRequest($this->request)
            && !$this->request->validateCsrfToken()
        ) {
            Yii::$app->session->setFlash('error', 'Your session has expired. Please try again.');
            $this->redirectBack();
            return false;
        }

        return parent::beforeAction($action);
    }

    /**
     * Redirects in a way that works for both regular and Inertia (XHR) requests.
     *
     * Yii's default redirect omits the Location header for AJAX requests, which Inertia needs.
     * 303 makes the browser follow PUT/PATCH/DELETE redirects with a GET, as Inertia expects.
     *
     * @param string|array $url
     * @return Response
     */
    protected function inertiaRedirect($url)
    {
        return Yii::$app->getResponse()->redirect(Url::to($url), 303, false);
    }

    /**
     * Redirects to the previous page on this site, or to the home page.
     *
     * @return Response
     */
    protected function redirectBack()
    {
        $referrer = (string) $this->request->referrer;
        $sameHost = $referrer !== '' && parse_url($referrer, PHP_URL_HOST) === $this->request->hostName;

        return $this->inertiaRedirect($sameHost ? $referrer : Yii::$app->homeUrl);
    }

    /**
     * denyCallback for AccessControl: guests go to the login page (and come back after signing in),
     * signed-in users get a 403.
     *
     * @throws ForbiddenHttpException
     */
    public function denyAccess()
    {
        $user = Yii::$app->user;
        if ($user->getIsGuest()) {
            if ($this->request->getIsGet()) {
                $user->setReturnUrl($this->request->getUrl());
            }
            $this->inertiaRedirect($user->loginUrl);
            return;
        }

        throw new ForbiddenHttpException('You are not allowed to access this page.');
    }

    /**
     * Redirects signed-in users away from guest-only pages (login, register, ...).
     *
     * @return Response|null
     */
    protected function redirectIfAuthenticated()
    {
        return Yii::$app->user->getIsGuest() ? null : $this->inertiaRedirect(['/dashboard']);
    }
}
