<?php

namespace PackagedUI\Pagelets\Actions;

class PageletLoad extends AbstractPageletAction
{
  protected $_url;
  protected $_target;

  protected function __construct() { }

  public static function i(string $url, string $target = '')
  {
    $o = new static();
    $o->_url = $url;
    $o->_target = $target;
    return $o;
  }

  public function url(string $url)
  {
    $this->_url = $url;
    return $this;
  }

  public function target(string $target = '')
  {
    $this->_target = $target;
    return $this;
  }

  public function getAction(): string
  {
    return 'load';
  }

  protected function _jsonSerialize(): array
  {
    return [
      'url'    => $this->_url,
      'target' => $this->_target,
    ];
  }
}
