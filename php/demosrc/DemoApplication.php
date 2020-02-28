<?php
namespace PackagedUI\PageletsDemo;

use Cubex\Application\Application;
use Packaged\Context\Context;
use Packaged\Dispatch\Dispatch;
use Packaged\Dispatch\ResourceManager;
use Packaged\Routing\Handler\FuncHandler;
use Packaged\Routing\Handler\Handler;
use Symfony\Component\HttpFoundation\Response;

class DemoApplication extends Application
{
  const DISPATCH_PATH = '/_r';

  protected function _generateRoutes()
  {
    yield self::_route(
      self::DISPATCH_PATH,
      new FuncHandler(function (Context $c): Response { return Dispatch::instance()->handleRequest($c->request()); })
    );
    return parent::_generateRoutes();
  }

  protected function _initialize()
  {
    parent::_initialize();
    Dispatch::bind(new Dispatch(dirname($this->getContext()->getProjectRoot()), self::DISPATCH_PATH))
      ->addAlias('dist', '/dist');
    ResourceManager::alias('dist')->requireJs('pagelets.min.js');
  }

  protected function _defaultHandler(): Handler
  {
    return new DemoController();
  }
}
