<?php
namespace demo;
class Demo
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
            ],
            'validate' => [
                ['required' => true, 'message' => '不能为空']
            ],
            'callback' => function($element){
                $element->clearable(true);
                $element->prefixIcon('el-icon-s-goods');
                return $element;
            }
        ];
    }

    public function number()
    {
        return [
            'type' => 'number',
            'title' => '数值',
            'field' => 'number',
            'col' => ['span' => 12],
            'props' => [
                'placeholder' => '请输入数值',
            ],
            'validate' => [
                ['required' => true],
                ['min' => 999, 'message' => '最小999'],
                ['max' => 9999],
            ]
        ];
    }

    public function enable()
    {
        return [
            'type' => 'radio',
            'title' => '有效',
            'field' => 'enable',
            'col' => ['span' => 6],
            'props' => [],
            'validate' => [],
            'options' => [
                ['value' => "2", 'label' => "不包邮", 'disabled' => false],
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
            'col' => ['span' => 6],
            'props' => [
                'activeValue' => "1",
                'inactiveValue' => "0",
            ],
        ];
    }

    public function city()
    {
        return [
            'type' => 'city',
            'col' => ['span' => 6],
            'title' => '所在区域',
            'field' => 'city',
            'options' => [
                ['value' => "2", 'label' => "不包邮", 'disabled' => false],
                ['value' => "1", 'label' => "包邮", 'disabled' => true],
            ],
        ];
    }

    public function date()
    {
        return [
            'type' => 'DatePicker',
            'title' => '时间选择',
            'field' => 'date',
            'props' => [
                'type' => "datetimerange",
                'format' => "yyyy-MM-dd HH:mm:ss",
                'placeholder' => '请选择活动日期',
            ],
        ];
    }

}