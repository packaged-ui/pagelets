<?php

namespace PackagedUI\Pagelets\Actions;

interface PageletActionInterface extends \JsonSerializable
{
  public function getAction(): string;
}
