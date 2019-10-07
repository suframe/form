<?php
use FormBuilder\Response;

$loader = require __DIR__ . DIRECTORY_SEPARATOR . 'vendor/autoload.php';
/** @var \Composer\Autoload\ClassLoader $loader */
$loader->addPsr4('demo\\', __DIR__ . DIRECTORY_SEPARATOR . 'demo');

if($_POST){
    header("content:application/json;chartset=uft-8");
    $response = Response::success('表单提交成功sdsdxcvxc');
    $response->send();
    exit;
}

$form = new \suframe\form\Form();
$form->createElm();
$form->setRuleByClass(\demo\Demo::class);
echo $form->view();