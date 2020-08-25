<?php

namespace PackagedUI\Pagelets\Actions;

class PageletCustomAction extends AbstractPageletAction
{
  protected $_action;
  protected $_data;

  protected function __construct() { }

  public static function i(string $action)
  {
    $o = new static();
    $o->_action = $action;
    return $o;
  }

  public function getAction(): string
  {
    return $this->_action;
  }

  public function setAction(string $action)
  {
    $this->_action = $action;
    return $this;
  }

  public function addData(string $key, $value)
  {
    $this->_data[$key] = $value;
    return $this;
  }

  public function setData(array $data)
  {
    $this->_data = $data;
    return $this;
  }

  public function getData()
  {
    return $this->_data;
  }

  protected function _jsonSerialize(): array
  {
    return $this->_data;
  }
}
