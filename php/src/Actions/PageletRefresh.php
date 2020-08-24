<?php

namespace PackagedUI\Pagelets\Actions;

class PageletRefresh extends AbstractPageletAction
{
  public $_target;
  public $_url;

  protected function __construct() { }

  public static function i(string $target = '', ?string $url = null)
  {
    $o = new static();
    $o->_target = $target;
    $o->_url = $url;
    return $o;
  }

  public function getAction(): string
  {
    return 'refresh';
  }

  protected function _jsonSerialize(): array
  {
    return [
      'target' => $this->_target,
      'url'    => $this->_url,
    ];
  }
}
