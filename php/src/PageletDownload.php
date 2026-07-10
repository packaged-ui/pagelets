<?php

namespace PackagedUI\Pagelets;

/**
 * Represents a file streamed to the browser as an attachment. The pagelets
 * client library detects the Content-Disposition header and performs a
 * binary-safe download instead of processing the response as a pagelet, so the
 * server only needs to send the file with the correct headers.
 */
class PageletDownload
{
  const DEFAULT_CONTENT_TYPE = 'application/octet-stream';

  private $_filename;
  private $_contentType;
  private $_data;

  protected function __construct() { }

  public static function i(string $filename, string $data, string $contentType = self::DEFAULT_CONTENT_TYPE)
  {
    $o = new static();
    $o->_filename = $filename;
    $o->_data = $data;
    $o->_contentType = $contentType ?: self::DEFAULT_CONTENT_TYPE;
    return $o;
  }

  public function getContentType(): string
  {
    return $this->_contentType;
  }

  public function getData(): string
  {
    return $this->_data;
  }

  public function getContentDisposition(): string
  {
    $escaped = str_replace(['\\', '"'], ['\\\\', '\\"'], $this->_filename);
    return 'attachment; filename="' . $escaped . '"';
  }

  /**
   * @return array<string,string> header name => value
   */
  public function getHeaders(): array
  {
    return [
      'Content-Type'        => $this->_contentType,
      'Content-Disposition' => $this->getContentDisposition(),
      'Content-Length'      => (string)strlen($this->_data),
    ];
  }

  /**
   * Emit the download headers and body to the client.
   */
  public function send(): void
  {
    foreach ($this->getHeaders() as $name => $value)
    {
      header($name . ': ' . $value);
    }
    echo $this->_data;
  }
}