<?php

namespace PackagedUI\Pagelets\Actions;

abstract class AbstractPageletAction implements PageletActionInterface
{
  abstract protected function _jsonSerialize(): array;

  final public function jsonSerialize(): mixed
  {
    $arr = $this->_jsonSerialize();
    $arr['action'] = $this->getAction();
    return $arr;
  }
}
