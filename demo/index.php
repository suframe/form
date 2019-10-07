<?php
$loader = require __DIR__ . DIRECTORY_SEPARATOR . 'vendor/autoload.php';
/** @var \Composer\Autoload\ClassLoader $loader */
$loader->addPsr4('demo\\', __DIR__ . DIRECTORY_SEPARATOR . 'demo');

$form = new \suframe\form\Form();
$form->createElm();
$form->setRuleByClass(\demo\Demo::class);
echo $form->view();