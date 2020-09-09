<?php

namespace PackagedUI\Pagelets\Actions;

class PageletRefresh extends AbstractPageletAction
{
  public $_target;

  protected function __construct() { }

  public static function i(string $target = '')
  {
    $o = new static();
    $o->_target = $target;
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
    ];
  }
}
