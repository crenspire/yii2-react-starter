<?php

namespace app\components;

use Yii;
use yii\web\ErrorHandler;
use yii\web\HttpException;
use yii\web\Response;
use Crenspire\Yii2Inertia\Inertia;

/**
 * Renders HTTP errors as the React `Error` page via Inertia.
 *
 * In debug mode, unexpected (non-HTTP) exceptions still use Yii's detailed exception page.
 */
class InertiaErrorHandler extends ErrorHandler
{
    /**
     * {@inheritdoc}
     */
    protected function renderException($exception)
    {
        if (YII_DEBUG && !$exception instanceof HttpException) {
            parent::renderException($exception);
            return;
        }

        if (Yii::$app->has('response')) {
            $response = Yii::$app->getResponse();
            // reset parameters of response to avoid interference with partially created response data
            // in case the error occurred while sending the response.
            $response->isSent = false;
            $response->stream = null;
            $response->data = null;
            $response->content = null;
        } else {
            $response = new Response();
        }

        $response->setStatusCodeByException($exception);
        $status = $response->getStatusCode();

        try {
            Inertia::render('Error', [
                'status' => $status,
                'message' => $this->errorMessage($exception, $status),
            ])->send();
        } catch (\Throwable $e) {
            // Rendering the page failed (e.g. inside the layout); fall back to Yii's error output
            parent::renderException($exception);
        }
    }

    /**
     * Shows the full Yii debug page inside Inertia's error modal instead of plain text.
     *
     * {@inheritdoc}
     */
    protected function shouldRenderSimpleHtml()
    {
        return YII_ENV_TEST || (Yii::$app->request->getIsAjax() && !Inertia::isInertiaRequest(Yii::$app->request));
    }

    /**
     * Client errors show the exception's message (written for users, e.g. "The requested user does not
     * exist."); server errors show a generic message so internals are never leaked.
     *
     * @param \Throwable $exception
     * @param int $status
     * @return string
     */
    private function errorMessage($exception, $status)
    {
        if ($exception instanceof HttpException && $status < 500 && $exception->getMessage() !== '') {
            return $exception->getMessage();
        }

        return Response::$httpStatuses[$status] ?? 'An error occurred';
    }
}
