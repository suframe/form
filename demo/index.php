<?php
$loader = require __DIR__ . DIRECTORY_SEPARATOR . 'vendor/autoload.php';
include __DIR__ . DIRECTORY_SEPARATOR . '/Fields.php';

$form = new \suframe\form\Form();
$form->createElm();
$form->setRuleByClass(Fields::class);
echo $form->view();