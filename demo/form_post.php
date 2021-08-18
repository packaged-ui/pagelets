<?php
echo '<b>Form Submission</b>';

echo '<ul>';
foreach($_REQUEST as $item => $value)
{
  echo '<li>' . $item . ': ' . $value . '</li>';
}
echo '</ul>';
echo '<ul>';
foreach($_FILES as $file)
{
  echo '<li>' . $file['name'] . ': ' . $file['size'] . '</li>';
}
echo '</ul>';
