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

$data = [
   'number' => 1024,
   'enable' => '2',
   'city' => ['四川省','成都市'],
   'citys' => ['四川省','成都市', '金牛区'],
   'date' => [date('Y-m-d', strtotime('-10 day')), date('Y-m-d')],
];

$citys = \FormBuilder\Factory\Elm::cityArea('citys', '城市2');
$form = new \suframe\form\Form();
$form->createElm();
$form->setData($data);
$form->setRuleByClass(\demo\Demo::class);
$form->append($citys);
echo $form->view();