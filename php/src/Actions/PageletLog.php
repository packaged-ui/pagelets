<?php

namespace PackagedUI\Pagelets\Actions;

class PageletLog extends AbstractPageletAction
{
  protected $_message;
  protected $_level;

  protected function __construct() { }

  public static function i(string $message, string $level = 'log')
  {
    $o = new static();
    $o->_message = $message;
    $o->_level = $level;
    return $o;
  }

  public function message(string $message)
  {
    $this->_message = $message;
    return $this;
  }

  public function level(string $level = 'log')
  {
    $this->_level = $level;
    return $this;
  }

  public function getAction(): string
  {
    return 'log';
  }

  protected function _jsonSerialize(): array
  {
    return [
      'message' => $this->_message,
      'level'   => $this->_level,
    ];
  }
}
