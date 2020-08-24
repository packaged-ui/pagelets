<?php

namespace PackagedUI\Pagelets\Actions;

class PageletLocation extends AbstractPageletAction
{
  protected $_url;
  protected $_replaceHistory = false;
  protected $_reloadWindow = false;

  protected function __construct() { }

  public static function i(string $url)
  {
    $o = new static();
    $o->_url = $url;
    return $o;
  }

  public function reload(bool $bool = true)
  {
    $this->_reloadWindow = $bool;
    return $this;
  }

  public function replace(bool $bool = true)
  {
    $this->_replaceHistory = $bool;
    return $this;
  }

  public function getAction(): string
  {
    return 'location';
  }

  protected function _jsonSerialize(): array
  {
    return [
      'url'     => $this->_url,
      'replace' => (bool)$this->_replaceHistory,
      'reload'  => (bool)$this->_reloadWindow,
    ];
  }
}
