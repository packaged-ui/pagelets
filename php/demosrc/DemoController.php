<?php

namespace PackagedUI\PageletsDemo;

use Cubex\Controller\Controller;
use Packaged\Context\Context;
use Packaged\Glimpse\Tags\Text\BoldText;
use Packaged\Http\Response;
use Packaged\Http\Responses\JsonResponse;
use Packaged\SafeHtml\SafeHtml;
use PackagedUI\Pagelets\Actions\PageletContent;
use PackagedUI\Pagelets\Actions\PageletCustomAction;
use PackagedUI\Pagelets\PageletResponse;
use PackagedUI\PageletsDemo\Layout\Layout;

class DemoController extends Controller
{
  protected function _generateRoutes()
  {
    yield self::_route('', 'index');
    yield self::_route('text', 'text');
    yield self::_route('html', 'html');
    yield self::_route('pagelet', 'pagelet');
    yield self::_route('custom.json', 'custom');
  }

  public function getIndex()
  {
    return 'this is the index page';
  }

  public function getText()
  {
    return 'this is a text/plain response';
  }

  public function getHtml()
  {
    return 'this is a text/html response';
  }

  public function getPagelet()
  {
    return PageletResponse::i()
      ->addAction(
        PageletContent::i(SafeHtml::escape(['this is a ', BoldText::create('pagelet'), 'response'])->getContent())
      );
  }

  public function getCustom()
  {
    return PageletResponse::i()
      ->addAction(PageletContent::i('other content ' . rand(), 'other'))
      ->addAction(PageletCustomAction::i('my-items')->setData(['items' => ["one", "two", "three"]]));
  }

  protected function _prepareResponse(Context $c, $result, $buffer = null)
  {
    if(!$c->request()->headers->has('x-pagelet-request'))
    {
      if($result instanceof Response)
      {
        $result = $result->getContent();
      }
      if($result instanceof PageletResponse)
      {
        foreach($result->getActions() as $action)
        {
          if($action instanceof PageletContent && empty($action->getTarget()))
          {
            $result = $action->getContent();
            break;
          }
        }
      }

      $theme = $this->_createTheme();
      $theme->setContext($this->getContext())->setContent($result);

      return parent::_prepareResponse($c, $theme, $buffer);
    }
    else if($result instanceof PageletResponse)
    {
      $result = JsonResponse::prefixed($result);
    }
    return parent::_prepareResponse($c, $result, $buffer);
  }

  protected function _createTheme()
  {
    return new Layout();
  }
}
