<?php

namespace PackagedUI\Pagelets\Actions;

class PageletContent extends AbstractPageletAction
{
  protected $_target;
  protected $_content;

  protected function __construct() { }

  public static function i($content, string $target = '')
  {
    $o = new static();
    $o->_content = $content;
    $o->_target = $target;
    return $o;
  }

  public function getAction(): string
  {
    return 'content';
  }

  protected function _jsonSerialize(): array
  {
    return ['content' => (string)$this->_content, 'target' => $this->_target];
  }
}
