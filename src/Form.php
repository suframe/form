<?php

namespace suframe\form;

use FormBuilder\Driver\CustomComponent;
use FormBuilder\Exception\FormBuilderException;
use FormBuilder\Factory\Elm;
use FormBuilder\Factory\Iview;

/**
 * Class Form
 * @mixin \FormBuilder\Form
 */
class Form
{
    /**
     * @var \FormBuilder\Form
     */
    protected $f;
    protected $data = [];

    /**
     * 创建element表单
     * @param null $action
     * @param string $method
     * @return $this
     * @throws \FormBuilder\Exception\FormBuilderException
     */
    public function createElm($action = null, $method = 'POST')
    {
        $this->f = Elm::createForm($action)->setMethod($method);
        return $this;
    }

    /**
     * 创建Iview表单
     * @param null $action
     * @param string $method
     * @return $this
     * @throws \FormBuilder\Exception\FormBuilderException
     */
    public function createIview($action = null, $method = 'POST')
    {
        $this->f = Iview::createForm($action)->setMethod($method);
        return $this;
    }

    public function setData($data)
    {
        $this->data = $data;
    }

    public function __call($name, $arguments)
    {
        return call_user_func_array([$this->f, $name], $arguments);
    }

    protected $customComponents = [];

    public function customComponentView()
    {
        $html = '';

        foreach ($this->customComponents as $customComponent) {
            $file = __DIR__ . '/templates/' . $customComponent . '.js';

            if (!file_exists($file)) {
                return false;
            }
            $tmp = file_get_contents($file);
            $html .= "\n" . $tmp;
        }
        return $html;
    }

    /**
     * 追加组件
     *
     * @param $component
     * @return \FormBuilder\Form
     * @throws FormBuilderException
     */
    public function appendCustom($component, $type = null)
    {
        $this->customComponents[] = $type;
        $this->append($component);
        return $this;
    }

    /**
     * @param array $rule
     * @return \FormBuilder\Form
     * @throws FormBuilderException
     */
    public function setRule(array $rule)
    {
        $newRule = [];
        foreach ($rule as $item) {
            $key = $item->getField();
            $value = $this->data[$key] ?? null;
            if ($value) {
                $item->value($value);
            }
            $newRule[$key] = $item;
        }
        $this->f->setRule($newRule);
        return $this;
    }

    public function view()
    {
        $rs = $this->customComponentView();
        $rs .= $this->f->view();
        return $rs;
    }

    /**
     * 追加组件
     *
     * @param CustomComponent $component
     * @return \FormBuilder\Form
     * @throws FormBuilderException
     */
    public function append($component)
    {
        $key = $component->getField();

        if (strpos($key, '.') !== false) {
            $newkey = '';
            $valueKey = $key = explode('.', $key);
            $value = $this->data;
            foreach ($key as $k => $item) {
                if($k == 0) {
                    $newkey .= $item;
                } else {
                    $newkey .= "['{$item}']";
                }
                $value = $value[$item] ?? null;
            }
            $component->field($newkey);
        } else {
            $value = $this->data[$key] ?? null;
        }
        if ($value) {
            $component->value($value);
        }
        $this->f->append($component);
        return $this;
    }

    /**
     * @param $class
     * @param array $exclude
     * @param array $include
     * @return $this
     * @throws FormBuilderException
     * @throws \ReflectionException
     */
    public function setRuleByClass($class, $exclude = [], $include = [])
    {
        $obj = new $class;
        $ref = new \ReflectionClass($obj);
        foreach ($ref->getMethods() as $method) {
            if (!$method->isPublic()) {
                continue;
            }
            $methodName = $method->getName();
            if ($exclude && in_array($methodName, $exclude)) {
                continue;
            }
            if ($include && !in_array($methodName, $include)) {
                continue;
            }
            $methodName = lcfirst($methodName);
            $config = $obj->$methodName();
            if (!$config) {
                continue;
            }
            $element = $this->buildElementByConfig($config);
            $this->append($element);
        }
        return $this;
    }

    protected $typeMap = [
        'switch' => 'switches',
    ];

    protected function typeMap($type)
    {
        return $this->typeMap[$type] ?? $type;
    }

    protected function buildElementByConfig($config)
    {
        $type = $config['type'] ?? 'input';
        $type = $this->typeMap($type);
        /** @var  $element */
        if (strpos($type, 'upload') === 0) {
            $element = Elm::$type($config['field'], $config['title'] ?? $config['field'], $config['action'] ?? '');
        } elseif ($type === 'number') {
            $element = Elm::$type($config['field'], $config['title'] ?? $config['field'], $config['value'] ?? 0);
        } elseif ($type === 'sku') {
            $type = 'sku';
            $this->customComponents[$type] = $type;
            $element = new CustomComponent($type);
            $element->field($config['field']);
            if (isset($config['title'])) {
                $element->title($config['title']);
            }
            $element->prop('title', $config['title'] ?? '规格设置');
            $element->value('specs', $config['specs'] ?? []);
        } elseif ($type === 'editor') {
            $type = 'editor';
            $this->customComponents[$type] = $type;
            $element = new CustomComponent($type);
            $element->field($config['field']);
            if (isset($config['title'])) {
                $element->title($config['title']);
            }
            $element->prop('action', $config['action'] ?? '');
            $element->prop('preview', $config['preview'] ?? false);
        } else {
            if (isset($config['value'])) {
                $element = Elm::$type($config['field'], $config['title'] ?? $config['field'], $config['value']);
            } else {
                $element = Elm::$type($config['field'], $config['title'] ?? $config['field']);
            }
        }
        if (isset($config['callback'])) {
            $element = $config['callback']($element);
        }
        //布局
        if (isset($config['col'])) {
            $col = Elm::col();
            foreach ($config['col'] as $key => $item) {
                $col->$key($item);
            }
            $element->col($col);
        }
        if (isset($config['options'])) {
            if ($type === 'cascader') {
                $element->options($config['options']);
            } else {
                $element->options(function () use ($config) {
                    $options = [];
                    foreach ($config['options'] as $k => $v) {
                        $option = Elm::option($v['value'], $v['label']);
                        if (isset($v['disabled'])) {
                            $option->disabled($v['disabled']);
                        }
                        $options[] = $option;
                    }
                    //等同于 [['value'=>0,'label'=>'好用'],['value'=>1,'label'=>'高效']]
                    return $options;
                });
            }
        }
        if (isset($config['props'])) {
            $element->props($config['props']);
        }
        //验证
        if (isset($config['validate'])) {
            $validateRules = ['min', 'max', 'length', 'enum', 'pattern'];
            foreach ($config['validate'] as $item) {
                $validate = $element->createValidate();
                if (isset($item['required']) && $item['required']) {
                    $validate->required();
                }
                if (isset($item['range']) && $item['range']) {
                    $validate->range(...$item['range']);
                }
                foreach ($validateRules as $validateRule) {
                    if (isset($item[$validateRule])) {
                        $validate->$validateRule($item[$validateRule]);
                    }
                }
                if (isset($item['message'])) {
                    $validate->message($item['message']);
                }
                if (isset($item['trigger'])) {
                    $validate->trigger($item['trigger']);
                }
                $element->appendValidate($validate);
            }
        }
        return $element;
    }

    /**
     * @return mixed
     */
    public function getF()
    {
        return $this->f;
    }

    /**
     * @return mixed
     */
    public function getData()
    {
        return $this->data;
    }
}