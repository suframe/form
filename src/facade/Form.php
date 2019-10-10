<?php

namespace suframe\form\facade;

use think\Facade;

/**
 * Class Form
 * @package suframe\form\facade
 * @mixin \suframe\form\Form
 */
class Form extends Facade
{

    protected static function getFacadeClass()
    {
        return \suframe\form\Form::class;
    }

}