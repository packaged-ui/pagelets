<?php

namespace PackagedUI\Pagelets;

use JsonSerializable;

class PageletResponse implements JsonSerializable
{
  private $_data = [];

  public static function i()
  {
    return new static();
  }

  public function setContent($content)
  {
    $this->_data['content'] = $content;
    return $this;
  }

  public function addPageletReload($target, $url = null)
  {
    $this->_data['reloadPagelet'][$target] = $url;
    return $this;
  }

  public function setLocation(string $url, $replaceHistory = false, $reloadWindow = false)
  {
    $this->_data['location']['url'] = $url;
    $this->_data['location']['replaceHistory'] = $replaceHistory;
    $this->_data['location']['reloadWindow'] = $reloadWindow;
    return $this;
  }

  public function redirect($url)
  {
    $this->setLocation($url, false, true);
    return $this;
  }

  public function setMeta($key, $value)
  {
    $this->_data['meta'][$key] = $value;
    return $this;
  }

  public function addJsResource($url)
  {
    $this->_data['resources']['js'][] = $url;
    return $this;
  }

  public function addCssResource($url)
  {
    $this->_data['resources']['css'][] = $url;
    return $this;
  }

  public function jsonSerialize()
  {
    return (object)$this->_data;
  }
}
