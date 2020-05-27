<?php

namespace PackagedUI\PageletsTest;

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

    $response->addCssResource('/my.css');
    $this->assertEquals(
    /** @lang JSON */
      '{"resources":{"css":["\/my.css"]}}',
      json_encode($response)
    );

    $response->addJsResource('/my.js');
    $this->assertEquals(
    /** @lang JSON */
      '{"resources":{"css":["\/my.css"],"js":["\/my.js"]}}',
      json_encode($response)
    );

    $response->setContent('<div>my content</div>');
    $this->assertEquals(
    /** @lang JSON */
      '{"resources":{"css":["\/my.css"],"js":["\/my.js"]},"content":{"":"<div>my content<\/div>"}}',
      json_encode($response)
    );

    $response->addPageletReload('#my-page', '/new-url');
    $this->assertEquals(
    /** @lang JSON */
      '{"resources":{"css":["\/my.css"],"js":["\/my.js"]},"content":{"":"<div>my content<\/div>"},"reloadPagelet":{"#my-page":"\/new-url"}}',
      json_encode($response)
    );

    $response->addPageletReload('#my-page2', '/new-url2');
    $this->assertEquals(
    /** @lang JSON */
      '{"resources":{"css":["\/my.css"],"js":["\/my.js"]},"content":{"":"<div>my content<\/div>"},"reloadPagelet":{"#my-page":"\/new-url","#my-page2":"\/new-url2"}}',
      json_encode($response)
    );

    $response->setLocation('/new-location', true);
    $this->assertEquals(
    /** @lang JSON */
      '{"resources":{"css":["\/my.css"],"js":["\/my.js"]},"content":{"":"<div>my content<\/div>"},"reloadPagelet":{"#my-page":"\/new-url","#my-page2":"\/new-url2"},"location":{"url":"\/new-location","replaceHistory":true,"reloadWindow":false}}',
      json_encode($response)
    );

    $response->redirect('/reload-page');
    $this->assertEquals(
    /** @lang JSON */
      '{"resources":{"css":["\/my.css"],"js":["\/my.js"]},"content":{"":"<div>my content<\/div>"},"reloadPagelet":{"#my-page":"\/new-url","#my-page2":"\/new-url2"},"location":{"url":"\/reload-page","replaceHistory":false,"reloadWindow":true}}',
      json_encode($response)
    );

    $response->setMeta('alert', ['type' => 'warning', 'message' => 'this is a warning']);
    $this->assertEquals(
    /** @lang JSON */
      '{"resources":{"css":["\/my.css"],"js":["\/my.js"]},"content":{"":"<div>my content<\/div>"},"reloadPagelet":{"#my-page":"\/new-url","#my-page2":"\/new-url2"},"location":{"url":"\/reload-page","replaceHistory":false,"reloadWindow":true},"meta":{"alert":{"type":"warning","message":"this is a warning"}}}',
      json_encode($response)
    );
  }
}
