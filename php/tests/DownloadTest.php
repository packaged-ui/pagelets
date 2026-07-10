<?php

namespace PackagedUI\PageletsTest;

use PackagedUI\Pagelets\PageletDownload;
use PHPUnit\Framework\TestCase;

class DownloadTest extends TestCase
{
  public function testDownload()
  {
    $download = PageletDownload::i('report.csv', 'a,b,c', 'text/csv');

    $this->assertEquals('attachment; filename="report.csv"', $download->getContentDisposition());
    $this->assertEquals(
      [
        'Content-Type'        => 'text/csv',
        'Content-Disposition' => 'attachment; filename="report.csv"',
        'Content-Length'      => '5',
      ],
      $download->getHeaders()
    );
    $this->assertEquals('a,b,c', $download->getData());
  }

  public function testDefaultContentType()
  {
    $download = PageletDownload::i('data.bin', "\x00\x01\x02");
    $headers = $download->getHeaders();

    $this->assertEquals('application/octet-stream', $headers['Content-Type']);
    $this->assertEquals('3', $headers['Content-Length']);
  }

  public function testEscapesFilenameQuotes()
  {
    $download = PageletDownload::i('quarterly "final".pdf', 'x', 'application/pdf');
    $this->assertEquals('attachment; filename="quarterly \\"final\\".pdf"', $download->getContentDisposition());
  }
}