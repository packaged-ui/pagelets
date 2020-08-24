<?php

namespace PackagedUI\PageletsTest;

use PackagedUI\Pagelets\Actions\PageletContent;
use PackagedUI\Pagelets\Actions\PageletCustomAction;
use PackagedUI\Pagelets\Actions\PageletLocation;
use PackagedUI\Pagelets\Actions\PageletRefresh;
use PackagedUI\Pagelets\Actions\PageletResource;
use PackagedUI\Pagelets\PageletResponse;
use PHPUnit\Framework\TestCase;

class PageletTest extends TestCase
{
  public function testPagelet()
  {
    $response = PageletResponse::i();
    $this->assertEquals(
    /** @lang JSON */
      '{}',
      json_encode($response)
    );

    $response->addAction(PageletResource::css('/my.css'));
    $this->assertEquals(
    /** @lang JSON */
      '{"actions":[{"type":"css","data":"\/my.css","inline":false,"action":"resource"}]}',
      json_encode($response)
    );

    $response->addAction(PageletResource::js('/my.js'));
    $this->assertEquals(
    /** @lang JSON */
      '{"actions":[{"type":"css","data":"\/my.css","inline":false,"action":"resource"},{"type":"js","data":"\/my.js","inline":false,"action":"resource"}]}',
      json_encode($response)
    );

    $response->addAction(PageletContent::i('<div>my content</div>'));
    $this->assertEquals(
    /** @lang JSON */
      '{"actions":[{"type":"css","data":"\/my.css","inline":false,"action":"resource"},{"type":"js","data":"\/my.js","inline":false,"action":"resource"},{"content":"<div>my content<\/div>","target":"","action":"content"}]}',
      json_encode($response)
    );

    $response->addAction(PageletRefresh::i('#my-page', '/new-url'));
    $this->assertEquals(
    /** @lang JSON */
      '{"actions":[{"type":"css","data":"\/my.css","inline":false,"action":"resource"},{"type":"js","data":"\/my.js","inline":false,"action":"resource"},{"content":"<div>my content<\/div>","target":"","action":"content"},{"target":"#my-page","url":"\/new-url","action":"refresh"}]}',
      json_encode($response)
    );

    $response->addAction(PageletRefresh::i('#my-page2', '/new-url2'));
    $this->assertEquals(
    /** @lang JSON */
      '{"actions":[{"type":"css","data":"\/my.css","inline":false,"action":"resource"},{"type":"js","data":"\/my.js","inline":false,"action":"resource"},{"content":"<div>my content<\/div>","target":"","action":"content"},{"target":"#my-page","url":"\/new-url","action":"refresh"},{"target":"#my-page2","url":"\/new-url2","action":"refresh"}]}',
      json_encode($response)
    );

    $response->addAction(PageletLocation::i('/new-location')->replace());
    $this->assertEquals(
    /** @lang JSON */
      '{"actions":[' .
      '{"type":"css","data":"\/my.css","inline":false,"action":"resource"},' .
      '{"type":"js","data":"\/my.js","inline":false,"action":"resource"},' .
      '{"content":"<div>my content<\/div>","target":"","action":"content"},' .
      '{"target":"#my-page","url":"\/new-url","action":"refresh"},' .
      '{"target":"#my-page2","url":"\/new-url2","action":"refresh"},' .
      '{"url":"\/new-location","replace":true,"reload":false,"action":"location"}' .
      ']}',
      json_encode($response)
    );

    $response->addAction(PageletLocation::i('/reload-page')->reload());
    $this->assertEquals(
    /** @lang JSON */
      '{"actions":[' .
      '{"type":"css","data":"\/my.css","inline":false,"action":"resource"},' .
      '{"type":"js","data":"\/my.js","inline":false,"action":"resource"},' .
      '{"content":"<div>my content<\/div>","target":"","action":"content"},' .
      '{"target":"#my-page","url":"\/new-url","action":"refresh"},' .
      '{"target":"#my-page2","url":"\/new-url2","action":"refresh"},' .
      '{"url":"\/new-location","replace":true,"reload":false,"action":"location"},' .
      '{"url":"\/reload-page","replace":false,"reload":true,"action":"location"}' .
      ']}',
      json_encode($response)
    );

    $response->addAction(
      PageletCustomAction::i('alert')->addData('type', 'warning')->addData('message', 'this is a warning')
    );
    $this->assertEquals(
    /** @lang JSON */
      '{"actions":[' .
      '{"type":"css","data":"\/my.css","inline":false,"action":"resource"},' .
      '{"type":"js","data":"\/my.js","inline":false,"action":"resource"},' .
      '{"content":"<div>my content<\/div>","target":"","action":"content"},' .
      '{"target":"#my-page","url":"\/new-url","action":"refresh"},' .
      '{"target":"#my-page2","url":"\/new-url2","action":"refresh"},' .
      '{"url":"\/new-location","replace":true,"reload":false,"action":"location"},' .
      '{"url":"\/reload-page","replace":false,"reload":true,"action":"location"},' .
      '{"type":"warning","message":"this is a warning","action":"alert"}' .
      ']}',
      json_encode($response)
    );
  }
}
