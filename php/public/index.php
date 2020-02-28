<?php
define('PHP_START', microtime(true));

use Cubex\Cubex;
use PackagedUI\PageletsDemo\DemoApplication;

$projectRoot = dirname(__DIR__);
$loader = require_once($projectRoot . '/vendor/autoload.php');

try
{
  $cubex = new Cubex($projectRoot, $loader);
  $cubex->handle(new DemoApplication($cubex), true);
}
catch(Throwable $e)
{
  var_dump($e);
  die('Unable to handle your request');
}
