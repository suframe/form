
suframe form
===============
suframe 创建vue表单，基于https://github.com/xaboy/form-create再次封装，

将表单字段封装到类，通过类自动生成表单。 

后期会基于tp6控制台，通过数据库表字段自动生成次文件，加速开发，一行命令生成表单。


## 环境需求
* PHP >= 7.2

## 支持
- **iViewUI 2.13.0+**
- **iViewUI 3.x**
- **ElementUI 2.8.2+**

## 主要功能

* 内置17种常用的表单组件
* 支持表单验证
* 支持生成任何 Vue 组件
* 支持栅格布局
* 可以配合 form-create 生成更复杂的表单

## 内置组件
* hidden
* input
* inputNumber
* checkbox
* radio
* switch
* select
* autoComplete
* cascader
* colorPicker
* datePicker
* timePicker
* rate
* slider
* upload
* tree
* frame

## 安装

~~~
composer require suframe/form
~~~

## 使用
```
$form = new \suframe\form\Form();
$form->createElm();
$form->setRuleByClass(Fields::class);
echo $form->view();
```

Fields类
```
class Fields
{

    public function title()
    {
        return [
            'type' => 'input',
            'title' => '名称',
            'field' => 'title',
            'col' => ['span' => 12],
            'props' => [
                'placeholder' => '请输入名称',
                'disabled' => true,
            ],
            'validate' => [
                ['required' => true]
            ],
            'callback' => function($element){
                $element->value(99999);
                return $element;
            }
        ];
    }

    public function enable()
    {
        return [
            'type' => 'radio',
            'title' => '有效',
            'field' => 'enable',
            'col' => ['span' => 12],
            'props' => [],
            'validate' => [],
            'options' => [
                ['value' => "0", 'label' => "不包邮", 'disabled' => false],
                ['value' => "1", 'label' => "包邮", 'disabled' => true],
            ],
        ];
    }

    public function open()
    {
        return [
            'type' => 'switch',
            'title' => '是否上架',
            'field' => 'open',
            'props' => [
                'activeValue' => "1",
                'inactiveValue' => "0",
            ],
        ];
    }

    public function cascader()
    {
        return [
            'type' => 'switch',
            'col' => ['span' => 12],
            'title' => '所在区域',
            'field' => 'cascader',
        ];
    }

    public function date()
    {
        return [
            'type' => 'DatePicker',
            'title' => '所在区域',
            'field' => 'date',
            'props' => [
                'type' => "datetimerange",
                'format' => "yyyy-MM-dd HH:mm:ss",
                'placeholder' => '请选择活动日期',
            ],
        ];
    }

}
```

![demo.jpg][1]

## 文档
主要文档参考form-create的文档
<p>
    <a href="http://www.form-create.com/v2/">
        <strong>简体中文</strong>
    </a>
    <a href="http://www.form-create.com/en/v2/">
        <strong>English</strong>
    </a>
</p>


## 命名规范

遵循PSR-2命名规范和PSR-4自动加载规范。

## 参与开发

QQ群：904592189


## 版权信息

suframe遵循Apache2开源协议发布，并提供免费使用。

版权所有Copyright © 2019- by qian <330576744@qq.com>

All rights reserved。

  [1]: https://raw.githubusercontent.com/suframe/form/master/demo/demo.jpg