<?php

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