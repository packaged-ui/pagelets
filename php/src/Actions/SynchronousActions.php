<?php

namespace PackagedUI\Pagelets\Actions;

class SynchronousActions extends AbstractPageletAction
{
  protected $_actions;

  protected function __construct() { }

  public static function i(PageletActionInterface ...$actions)
  {
    $o = new static();
    $o->_actions = $actions;
    return $o;
  }

  public function getAction(): string
  {
    return 'synchronous';
  }

  public function getActions()
  {
    return $this->_actions;
  }

  protected function _jsonSerialize(): array
  {
    return ['content' => (string)$this->_actions];
  }
}
