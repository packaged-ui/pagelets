<?php

namespace PackagedUI\Pagelets;

use JsonSerializable;
use PackagedUI\Pagelets\Actions\PageletActionInterface;

class PageletResponse implements JsonSerializable
{
  private $_data = [];

  public static function i()
  {
    return new static();
  }

  public function addAction(PageletActionInterface $action)
  {
    $this->_data['actions'][] = $action;
    return $this;
  }

  public function jsonSerialize()
  {
    return (object)$this->_data;
  }

  public function __toString()
  {
    return ")]}'" . json_encode($this);
  }
}
