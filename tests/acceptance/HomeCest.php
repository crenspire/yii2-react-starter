<?php

class HomeCest
{
    public function ensureThatHomePageWorks(AcceptanceTester $I)
    {
        $I->amOnPage('/');
        $I->waitForText('Sign', 10);
        $I->seeElement('#app');
    }
}
