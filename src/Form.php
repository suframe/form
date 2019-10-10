<?php
namespace suframe\form;
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

    /**
     * 追加组件
     *
     * @param $component
     * @return \FormBuilder\Form
     * @throws FormBuilderException
     */
    public function append($component)
    {
        $key = $component->getField();
        $value = $this->data[$key] ?? null;
        if ($value) {
            $component->value($value);
        }
        $this->f->append($component);
        return $this;
    }

    public function setRuleByClass($class)
    {
        $obj = new $class;
        $ref = new \ReflectionClass($obj);
        foreach ($ref->getMethods() as $method) {
            if (!$method->isPublic()) {
                continue;
            }
            $method = lcfirst($method->getName());
            $config = $obj->$method();
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
        if(strpos($type, 'upload') === 0) {
            $element = Elm::$type($config['field'], $config['title'] ?? $config['field'], $config['action'] ?? '');
        } else {
            $element = Elm::$type($config['field'], $config['title'] ?? $config['field']);
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
            $element->options(function () use ($config) {
                $options = [];
                foreach ($config['options'] as $k => $v) {
                    $option = Elm::option($v['value'], $v['label']);
                    if(isset($v['disabled'])){
                        $option->disabled($v['disabled']);
                    }
                    $options[] = $option;
                }
                //等同于 [['value'=>0,'label'=>'好用'],['value'=>1,'label'=>'高效']]
                return $options;
            });
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