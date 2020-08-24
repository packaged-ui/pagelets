<?php

namespace PackagedUI\Pagelets\Actions;

class PageletResource extends AbstractPageletAction
{
  private const TYPE_CSS = 'css';
  private const TYPE_JS  = 'js';

  protected $_type;
  protected $_data;
  protected $_inline = false;

  protected function __construct() { }

  public static function css(string $data)
  {
    $o = new static();
    $o->_type = self::TYPE_CSS;
    $o->_data = $data;
    return $o;
  }

  public static function js($data)
  {
    $o = new static();
    $o->_type = self::TYPE_JS;
    $o->_data = $data;
    return $o;
  }

  public function inline(bool $bool = true)
  {
    $this->_inline = $bool;
    return $this;
  }

  public function getAction(): string
  {
    return 'resource';
  }

  protected function _jsonSerialize(): array
  {
    return [
      'type'   => $this->_type,
      'data'   => $this->_data,
      'inline' => $this->_inline,
    ];
  }
}
