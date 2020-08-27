<?php

namespace PackagedUI\Pagelets;

use JsonSerializable;
use PackagedUI\Pagelets\Actions\PageletActionInterface;
use PackagedUI\Pagelets\Actions\PageletContent;
use PackagedUI\Pagelets\Actions\PageletLocation;
use PackagedUI\Pagelets\Actions\PageletRefresh;
use PackagedUI\Pagelets\Actions\PageletResource;

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

  public function getActions()
  {
    return $this->_data['actions'];
  }

  public function setContent($content, string $target = '')
  {
    $this->addAction(PageletContent::i($content, $target));
    return $this;
  }

  public function loadPagelet($target, $url = null)
  {
    $this->addAction(PageletRefresh::i($target, $url));
    return $this;
  }

  public function windowLocation(string $url, bool $replaceHistory = false, bool $reloadWindow = false)
  {
    $this->addAction(PageletLocation::i($url)->replace($replaceHistory)->reload($reloadWindow));
    return $this;
  }

  public function redirect($url, bool $replace = false)
  {
    $this->windowLocation($url, $replace, true);
    return $this;
  }

  public function addJsResource(string $data, bool $isUrl = true)
  {
    $this->addAction(PageletResource::js($data)->inline(!$isUrl));
    return $this;
  }

  public function addCssResource(string $data, bool $isUrl = true)
  {
    $this->addAction(PageletResource::css($data)->inline(!$isUrl));
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
