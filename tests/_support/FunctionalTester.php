<?php


/**
 * Inherited Methods
 * @method void wantToTest($text)
 * @method void wantTo($text)
 * @method void execute($callable)
 * @method void expectTo($prediction)
 * @method void expect($prediction)
 * @method void amGoingTo($argumentation)
 * @method void am($role)
 * @method void lookForwardTo($achieveValue)
 * @method void comment($description)
 * @method \Codeception\Lib\Friend haveFriend($name, $actorClass = NULL)
 *
 * @SuppressWarnings(PHPMD)
*/
class FunctionalTester extends \Codeception\Actor
{
    use _generated\FunctionalTesterActions;

    /**
     * Sends the headers the Inertia client sends with every visit.
     */
    public function amUsingInertia()
    {
        $this->haveHttpHeader('X-Inertia', 'true');
        $this->haveHttpHeader('X-Inertia-Version', \Crenspire\Yii2Inertia\Inertia::getVersion());
        $this->haveHttpHeader('X-Requested-With', 'XMLHttpRequest');
    }

    /**
     * Returns the Inertia page object from a JSON (Inertia) or HTML (first visit) response.
     *
     * @return array{component: string, props: array, url: string, version: string}
     */
    public function grabInertiaPage()
    {
        $json = json_decode($this->grabPageSource(), true);
        if (is_array($json) && isset($json['component'])) {
            return $json;
        }

        return json_decode($this->grabTextFrom('script[data-page="app"]'), true);
    }

    /**
     * Asserts a header of the last response. Relative URLs are compared against the end of the value,
     * since Yii makes redirect URLs absolute.
     *
     * @param string $name
     * @param string $expected
     */
    public function seeResponseHeaderEndsWith($name, $expected)
    {
        $actual = (string) Yii::$app->response->headers->get($name);
        $this->assertStringEndsWith($expected, $actual, "Header {$name} is \"{$actual}\"");
    }

    /**
     * @param string $component
     */
    public function seeInertiaComponent($component)
    {
        $this->assertSame($component, $this->grabInertiaPage()['component']);
    }
}
